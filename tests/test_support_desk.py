import unittest
from support_desk import create_ticket, list_tickets, get_ticket, update_ticket_status

class TestSupportDesk(unittest.TestCase):
    def setUp(self):
        # Clear global tickets list before each test
        from support_desk import tickets
        tickets.clear()

    def test_create_ticket(self):
        ticket = create_ticket("Test subject", "Test description", "high")
        self.assertEqual(ticket["subject"], "Test subject")
        self.assertEqual(ticket["priority"], "high")
        self.assertEqual(ticket["status"], "open")
        self.assertIsNotNone(ticket["created_at"])

    def test_list_tickets_default(self):
        create_ticket("A")
        create_ticket("B")
        self.assertEqual(len(list_tickets()), 2)

    def test_list_tickets_filtered(self):
        create_ticket("A")
        t = create_ticket("B")
        update_ticket_status(t["id"], "closed")
        open_tickets = list_tickets("open")
        self.assertEqual(len(open_tickets), 1)
        self.assertEqual(open_tickets[0]["subject"], "A")

    def test_get_ticket_exists(self):
        t = create_ticket("Test")
        result = get_ticket(t["id"])
        self.assertIsNotNone(result)
        self.assertEqual(result["id"], t["id"])

    def test_get_ticket_not_found(self):
        self.assertIsNone(get_ticket(999))

    def test_update_ticket_status(self):
        t = create_ticket("Test")
        self.assertTrue(update_ticket_status(t["id"], "resolved"))
        self.assertEqual(get_ticket(t["id"])["status"], "resolved")

    def test_update_ticket_not_found(self):
        self.assertFalse(update_ticket_status(999, "closed"))

if __name__ == "__main__":
    unittest.main()
