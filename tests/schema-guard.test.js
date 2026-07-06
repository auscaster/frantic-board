const { createSchemaGuard } = require('../schema-guard');

describe('schemaGuard', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number', minimum: 0 }
    },
    required: ['name', 'age']
  };

  const guard = createSchemaGuard(schema);

  test('passes valid data', () => {
    const data = { name: 'Alice', age: 30 };
    expect(() => guard(data)).not.toThrow();
    expect(guard(data)).toEqual(data);
  });

  test('throws on missing required field', () => {
    expect(() => guard({ name: 'Bob' })).toThrow('Schema validation failed');
  });

  test('throws on wrong type', () => {
    expect(() => guard({ name: 'Charlie', age: 'old' })).toThrow('Schema validation failed');
  });

  test('throws on out of range', () => {
    expect(() => guard({ name: 'Dave', age: -1 })).toThrow('Schema validation failed');
  });
});
