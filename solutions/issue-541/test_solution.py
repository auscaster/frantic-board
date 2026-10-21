"""
Unit Tests for Issue #541 Solution
"""

import unittest
from solution import SolutionHandler

class TestSolution(unittest.TestCase):
    def setUp(self):
        self.handler = SolutionHandler()

    def test_execution(self):
        res = self.handler.execute()
        self.assertEqual(res.get("status"), "success")
        self.assertTrue(res.get("processed"))

if __name__ == "__main__":
    unittest.main()
