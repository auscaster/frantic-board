# Runx Skill: Bookkeeper

A simple bookkeeping skill for runx that manages a ledger of income and expense transactions.

## Usage

```javascript
const Bookkeeper = require('runx-skill-bookkeeper');
const bk = new Bookkeeper();

// Add a transaction
bk.addTransaction('Freelance payment', 1500, 'income');
bk.addTransaction('Office supplies', 200, 'expense');

// Get current balance
console.log(bk.getBalance()); // 1300

// List all transactions
console.log(bk.listTransactions());

// Clear ledger
bk.clearLedger();
```

## API

- `addTransaction(description, amount, type)` - Adds a transaction. Type must be `'income'` or `'expense'`.
- `getBalance()` - Returns the net balance.
- `listTransactions()` - Returns an array of transaction objects.
- `clearLedger()` - Removes all transactions.

## Tests

Run `npm test` to execute the test suite.