import { schemaGuard } from './schema-guard';

describe('schemaGuard', () => {
  it('validates correct input', () => {
    const input = { name: 'John', age: 30, email: 'john@example.com' };
    expect(schemaGuard(input)).toEqual(input);
  });

  it('throws on missing field', () => {
    const input = { name: 'John', age: 30 };
    expect(() => schemaGuard(input)).toThrow('Schema validation failed');
  });

  it('throws on invalid email', () => {
    const input = { name: 'John', age: 30, email: 'invalid' };
    expect(() => schemaGuard(input)).toThrow();
  });
});
