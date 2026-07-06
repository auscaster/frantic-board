class Ledger {
  constructor() {
    this.transactions = [];
  }

  add(description, amount, type) {
    const transaction = {
      id: this.transactions.length + 1,
      description,
      amount,
      type,
      date: new Date().toISOString()
    };
    this.transactions.push(transaction);
    return transaction;
  }

  balance() {
    return this.transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }

  list() {
    return [...this.transactions];
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = Ledger;