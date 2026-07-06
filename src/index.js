const Ledger = require('./ledger');

class Bookkeeper {
  constructor() {
    this.ledger = new Ledger();
  }

  addTransaction(description, amount, type = 'expense') {
    if (typeof description !== 'string' || description.trim() === '') {
      throw new Error('Description must be a non-empty string');
    }
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    if (!['income', 'expense'].includes(type)) {
      throw new Error('Type must be "income" or "expense"');
    }
    return this.ledger.add(description, amount, type);
  }

  getBalance() {
    return this.ledger.balance();
  }

  listTransactions() {
    return this.ledger.list();
  }

  clearLedger() {
    this.ledger.clear();
  }
}

module.exports = Bookkeeper;