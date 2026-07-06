// bookkeeper.js - RunX Skill: Bookkeeper
// Tracks transactions and maintains a simple ledger.

class Bookkeeper {
  constructor() {
    this.ledger = [];
    this.balances = {};
  }

  /**
   * Record a transaction.
   * @param {string} from - Sender account.
   * @param {string} to - Recipient account.
   * @param {number} amount - Amount transferred (positive number).
   * @param {string} [description] - Optional description.
   * @returns {object} Transaction record.
   * @throws {Error} If amount is not positive or accounts are invalid.
   */
  recordTransaction(from, to, amount, description = '') {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number.');
    }
    if (!from || !to) {
      throw new Error('Both from and to accounts must be specified.');
    }
    if (!this.balances[from]) {
      this.balances[from] = 0;
    }
    if (!this.balances[to]) {
      this.balances[to] = 0;
    }
    if (this.balances[from] < amount) {
      throw new Error('Insufficient balance in source account.');
    }

    const transaction = {
      id: this.ledger.length + 1,
      from,
      to,
      amount,
      description,
      timestamp: new Date().toISOString()
    };

    this.balances[from] -= amount;
    this.balances[to] += amount;
    this.ledger.push(transaction);

    return transaction;
  }

  /**
   * Get balance for an account.
   * @param {string} account - Account name.
   * @returns {number} Current balance.
   */
  getBalance(account) {
    return this.balances[account] || 0;
  }

  /**
   * Get all transactions.
   * @returns {Array} Ledger entries.
   */
  getLedger() {
    return this.ledger.slice();
  }

  /**
   * Get transactions involving a specific account.
   * @param {string} account - Account name.
   * @returns {Array} Filtered transactions.
   */
  getTransactionsForAccount(account) {
    return this.ledger.filter(tx => tx.from === account || tx.to === account);
  }
}

// Export the class for use as a RunX skill.
module.exports = Bookkeeper;
