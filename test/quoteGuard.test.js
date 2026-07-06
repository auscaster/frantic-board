const quoteGuard = require('../quoteGuard');

describe('quoteGuard', () => {
  test('escapes single quotes', () => {
    expect(quoteGuard("it's")).toBe("it\\'s");
  });

  test('escapes double quotes', () => {
    expect(quoteGuard('he said "hello"')).toBe('he said \\"hello\\"');
  });

  test('escapes both types', () => {
    expect(quoteGuard("'\"'")).toBe("\\'\\"\\'");
  });

  test('returns input unchanged if no quotes', () => {
    expect(quoteGuard('hello')).toBe('hello');
  });

  test('throws if input is not a string', () => {
    expect(() => quoteGuard(123)).toThrow(TypeError);
  });
});
