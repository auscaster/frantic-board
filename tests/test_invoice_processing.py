import unittest
from src.invoice_processing import Invoice, PurchaseOrder, Receipt, three_way_match

class TestThreeWayMatch(unittest.TestCase):

    def setUp(self):
        self.invoice = Invoice(
            invoice_id='INV-001',
            vendor='Acme Corp',
            amount=1000.00,
            date='2023-01-15',
            po_number='PO-123'
        )
        self.po = PurchaseOrder(
            po_number='PO-123',
            vendor='Acme Corp',
            amount=1000.00,
            items=[{'sku': 'A1', 'quantity': 10}, {'sku': 'B2', 'quantity': 5}]
        )
        self.receipt = Receipt(
            receipt_id='RCP-001',
            po_number='PO-123',
            items_received=[{'sku': 'A1', 'quantity': 10}, {'sku': 'B2', 'quantity': 5}]
        )

    def test_full_match(self):
        result = three_way_match(self.invoice, self.po, self.receipt)
        self.assertTrue(result['overall_match'])
        self.assertTrue(result['vendor_match'])
        self.assertTrue(result['amount_match'])
        self.assertTrue(result['items_match'])

    def test_vendor_mismatch(self):
        invoice = Invoice(
            invoice_id='INV-002',
            vendor='Other Corp',
            amount=1000.00,
            date='2023-01-15',
            po_number='PO-123'
        )
        result = three_way_match(invoice, self.po, self.receipt)
        self.assertFalse(result['vendor_match'])
        self.assertFalse(result['overall_match'])

    def test_amount_mismatch(self):
        invoice = Invoice(
            invoice_id='INV-003',
            vendor='Acme Corp',
            amount=999.99,
            date='2023-01-15',
            po_number='PO-123'
        )
        result = three_way_match(invoice, self.po, self.receipt)
        self.assertFalse(result['amount_match'])
        self.assertFalse(result['overall_match'])

    def test_items_mismatch(self):
        receipt = Receipt(
            receipt_id='RCP-002',
            po_number='PO-123',
            items_received=[{'sku': 'A1', 'quantity': 9}, {'sku': 'B2', 'quantity': 5}]
        )
        result = three_way_match(self.invoice, self.po, receipt)
        self.assertFalse(result['items_match'])
        self.assertFalse(result['overall_match'])

    def test_no_po(self):
        result = three_way_match(self.invoice, None, self.receipt)
        self.assertFalse(result['overall_match'])
        self.assertIsNone(result['po_number'])

    def test_no_receipt(self):
        result = three_way_match(self.invoice, self.po, None)
        self.assertFalse(result['overall_match'])
        self.assertIsNone(result['receipt_id'])

if __name__ == '__main__':
    unittest.main()
