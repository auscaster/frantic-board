import json
import unittest
from firewatch import handle_event

class TestFirewatchSkill(unittest.TestCase):
    def test_handle_fire_alarm_high(self):
        event = {'type': 'fire_alarm', 'location': 'Building A', 'severity': 'high'}
        result = handle_event(event, {})
        self.assertEqual(result['status'], 'processed')
        self.assertEqual(result['action'], 'notified_firewatch_team')

    def test_handle_smoke_detected_low(self):
        event = {'type': 'smoke_detected', 'location': 'Kitchen', 'severity': 'low'}
        result = handle_event(event, {})
        self.assertEqual(result['status'], 'processed')
        self.assertEqual(result['action'], 'logged')

    def test_unsupported_event(self):
        event = {'type': 'earthquake', 'location': 'Any'}
        result = handle_event(event, {})
        self.assertIn('error', result)
        self.assertEqual(result['status'], 'failure')

if __name__ == '__main__':
    unittest.main()
