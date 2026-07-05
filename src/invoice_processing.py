import csv
import json
from datetime import datetime
from typing import List, Dict, Optional

class Invoice:
    def __init__(self, invoice_id: str, vendor: str, amount: float, date: str, po_number: Optional[str] = None):
        self.invoice_id = invoice_id
        self.vendor = vendor
        self.amount = amount
        self.date = datetime.strptime(date, '%Y-%m-%d')
        self.po_number = po_number

class PurchaseOrder:
    def __init__(self, po_number: str, vendor: str, amount: float, items: List[Dict]):
        self.po_number = po_number
        self.vendor = vendor
        self.amount = amount
        self.items = items

class Receipt:
    def __init__(self, receipt_id: str, po_number: str, items_received: List[Dict]):
        self.receipt_id = receipt_id
        self.po_number = po_number
        self.items_received = items_received

def load_invoices(file_path: str) -> List[Invoice]:
    invoices = []
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            invoice = Invoice(
                invoice_id=row['invoice_id'],
                vendor=row['vendor'],
                amount=float(row['amount']),
                date=row['date'],
                po_number=row.get('po_number')
            )
            invoices.append(invoice)
    return invoices

def load_purchase_orders(file_path: str) -> List[PurchaseOrder]:
    with open(file_path, 'r') as f:
        data = json.load(f)
    return [PurchaseOrder(**po) for po in data]

def load_receipts(file_path: str) -> List[Receipt]:
    with open(file_path, 'r') as f:
        data = json.load(f)
    return [Receipt(**rec) for rec in data]

def three_way_match(invoice: Invoice, po: PurchaseOrder, receipt: Receipt) -> Dict:
    """
    Perform three-way matching between invoice, purchase order, and receipt.
    Returns a dictionary with match status and details.
    """
    result = {
        'invoice_id': invoice.invoice_id,
        'po_number': po.po_number if po else None,
        'receipt_id': receipt.receipt_id if receipt else None,
        'vendor_match': False,
        'amount_match': False,
        'items_match': False,
        'overall_match': False
    }

    # Vendor match
    if invoice.vendor == po.vendor:
        result['vendor_match'] = True

    # Amount match (allow small tolerance)
    if abs(invoice.amount - po.amount) <= 0.01:
        result['amount_match'] = True

    # Items match (check if received items match invoice items)
    if receipt and po:
        po_items = {item['sku']: item['quantity'] for item in po.items}
        rec_items = {item['sku']: item['quantity'] for item in receipt.items_received}
        if po_items == rec_items:
            result['items_match'] = True

    # Overall match
    if result['vendor_match'] and result['amount_match'] and result['items_match']:
        result['overall_match'] = True

    return result

def process_invoices(invoice_file: str, po_file: str, receipt_file: str) -> List[Dict]:
    invoices = load_invoices(invoice_file)
    pos = load_purchase_orders(po_file)
    receipts = load_receipts(receipt_file)

    results = []
    for invoice in invoices:
        # Find matching PO
        po = next((p for p in pos if p.po_number == invoice.po_number), None)
        # Find matching receipt
        receipt = next((r for r in receipts if r.po_number == invoice.po_number), None)
        match_result = three_way_match(invoice, po, receipt)
        results.append(match_result)

    return results

if __name__ == '__main__':
    # Example usage
    results = process_invoices('invoices.csv', 'purchase_orders.json', 'receipts.json')
    for r in results:
        print(r)
