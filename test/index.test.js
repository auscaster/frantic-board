const Bookkeeper = require('../src/index');

describe('Bookkeeper', () => {
  let bk;

  beforeEach(() => {
    bk = new Bookkeeper();
  });

  test('add income transaction', () => {
    const tx = bk.addTransaction('Salary', 5000, 'income');
    expect(tx.description).toBe('Salary');
    expect(tx.amount).toBe(5000);
    expect(tx.type).toBe('income');
    expect(bk.getBalance()).toBe(5000);
  });

  test('add expense transaction', () => {
    bk.addTransaction('Rent', 1000, 'expense');
    expect(bk.getBalance()).toBe(-1000);
  });

  test('balance with multiple transactions', () => {
    bk.addTransaction('Income', 2000, 'income');
    bk.addTransaction('Expense', 500, 'expense');
    bk.addTransaction('Income', 300, 'income');
    expect(bk.getBalance()).toBe(1800);
  });

  test('list transactions', () => {
    bk.addTransaction('A', 100, 'income');
    bk.addTransaction('B', 50, 'expense');
    const list = bk.listTransactions();
    expect(list).toHaveLength(2);
  });

  test('clear ledger', () => {
    bk.addTransaction('Test', 1, 'income');
    bk.clearLedger();
    expect(bk.getBalance()).toBe(0);
    expect(bk.listTransactions()).toHaveLength(0);
  });

  test('invalid description throws', () => {
    expect(() => bk.addTransaction('', 100, 'income')).toThrow();
  });

  test('invalid amount throws', () => {
    expect(() => bk.addTransaction('Test', -100, 'income')).toThrow();
  });

  test('invalid type throws', () => {
    expect(() => bk.addTransaction('Test', 100, 'invalid')).toThrow();
  });
});