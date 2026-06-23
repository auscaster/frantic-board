import json
import re
from datetime import datetime

class InvoiceIntake:
    """
    Handles invoice intake and three-way matching against purchase orders and receiving reports.
    """

    def __init__(self, db_connection=None):
        self.db = db_connection
        self.invoices = []

    def ingest_invoice(self, invoice_data):
        """
        Ingest an invoice from raw data (dict or JSON string).
        Validates required fields and stores it.
        """
        if isinstance(invoice_data, str):
            try:
                invoice_data = json.loads(invoice_data)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON string provided for invoice.")

        required_fields = ['invoice_number', 'vendor', 'amount', 'date', 'po_number']
        missing = [f for f in required_fields if f not in invoice_data]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        # Validate amount is positive number
        try:
            amount = float(invoice_data['amount'])
            if amount <= 0:
                raise ValueError("Invoice amount must be positive.")
        except (TypeError, ValueError):
            raise ValueError("Invoice amount must be a positive number.")

        # Validate date format (YYYY-MM-DD)
        date_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')
        if not date_pattern.match(invoice_data['date']):
            raise ValueError("Invoice date must be in YYYY-MM-DD format.")

        invoice = {
            'invoice_number': invoice_data['invoice_number'],
            'vendor': invoice_data['vendor'],
            'amount': amount,
            'date': invoice_data['date'],
            'po_number': invoice_data['po_number'],
            'status': 'pending'
        }
        self.invoices.append(invoice)
        return invoice

    def three_way_match(self, invoice, purchase_order, receiving_report):
        """
        Perform three-way matching between invoice, purchase order, and receiving report.
        Returns a dict with match status and details.
        """
        result = {
            'invoice_number': invoice['invoice_number'],
            'po_number': invoice['po_number'],
            'match': True,
            'discrepancies': []
        }

        # Check vendor match
        if invoice['vendor'].lower() != purchase_order.get('vendor', '').lower():
            result['match'] = False
            result['discrepancies'].append('Vendor mismatch between invoice and purchase order.')

        # Check amount match (allow small tolerance for rounding)
        tolerance = 0.01
        if abs(invoice['amount'] - purchase_order.get('amount', 0)) > tolerance:
            result['match'] = False
            result['discrepancies'].append('Amount mismatch between invoice and purchase order.')

        # Check receiving report exists and quantities match
        if receiving_report is None:
            result['match'] = False
            result['discrepancies'].append('No receiving report found for this purchase order.')
        else:
            # Assume receiving report has 'quantity_received' and purchase order has 'quantity_ordered'
            if receiving_report.get('quantity_received', 0) < purchase_order.get('quantity_ordered', 0):
                result['match'] = False
                result['discrepancies'].append('Quantity received is less than quantity ordered.')

        # Update invoice status based on match
        if result['match']:
            invoice['status'] = 'matched'
        else:
            invoice['status'] = 'discrepancy'

        return result

    def get_invoice_by_number(self, invoice_number):
        """Retrieve an invoice by its number."""
        for inv in self.invoices:
            if inv['invoice_number'] == invoice_number:
                return inv
        return None

    def list_invoices(self, status=None):
        """List all invoices, optionally filtered by status."""
        if status:
            return [inv for inv in self.invoices if inv['status'] == status]
        return self.invoices
