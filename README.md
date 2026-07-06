# Bookkeeper Skill for RunX

Simple bookkeeping skill that records transactions and maintains balances.

## Usage

```javascript
const Bookkeeper = require('./bookkeeper');
const bk = new Bookkeeper();
bk.recordTransaction('alice', 'bob', 100, 'payment');
console.log(bk.getBalance('bob')); // 100
```

## API

- `recordTransaction(from, to, amount, description?)` - Record a transaction.
- `getBalance(account)` - Get balance for an account.
- `getLedger()` - Get all transactions.
- `getTransactionsForAccount(account)` - Get transactions for a specific account.
