// test/bookkeeper.test.js - Tests for Bookkeeper skill
const Bookkeeper = require('../bookkeeper');

describe('Bookkeeper', () => {
  let bk;

  beforeEach(() => {
    bk = new Bookkeeper();
  });

  test('should record a transaction and update balances', () => {
    bk.recordTransaction('alice', 'bob', 100, 'gift');
    expect(bk.getBalance('alice')).toBe(-100); // initial 0, subtracted
    expect(bk.getBalance('bob')).toBe(100);
    expect(bk.getLedger().length).toBe(1);
  });

  test('should throw error on negative amount', () => {
    expect(() => bk.recordTransaction('a', 'b', -10)).toThrow('Amount must be a positive number.');
  });

  test('should throw error on insufficient balance', () => {
    expect(() => bk.recordTransaction('a', 'b', 50)).toThrow('Insufficient balance in source account.');
  });

  test('should retrieve transactions for an account', () => {
    bk.recordTransaction('x', 'y', 10);
    bk.recordTransaction('y', 'z', 5);
    const txForY = bk.getTransactionsForAccount('y');
    expect(txForY.length).toBe(2);
  });
});
