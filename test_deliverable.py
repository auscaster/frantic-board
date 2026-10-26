import importlib
import unittest

class TestDeliverable(unittest.TestCase):
    def test_module_import_and_exports(self):
        mod = importlib.import_module('deliverable')
        self.assertIsNotNone(mod)
        exported = [n for n in dir(mod) if not n.startswith('_')]
        self.assertGreater(len(exported), 0, 'Deliverable must expose at least one substantive public entity.')
        if hasattr(mod, 'solution') and callable(getattr(mod, 'solution')):
            res = mod.solution()
            self.assertIsNotNone(res)

if __name__ == '__main__':
    unittest.main()
