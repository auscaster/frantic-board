const Ajv = require('ajv');

/**
 * Creates a schema guard middleware for runx skills.
 * Validates input data against the provided JSON schema.
 * Throws an error if validation fails.
 *
 * @param {Object} schema - JSON schema object.
 * @returns {Function} Middleware function (data => validatedData).
 */
function createSchemaGuard(schema) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  return function schemaGuard(data) {
    const valid = validate(data);
    if (!valid) {
      const errors = validate.errors.map(e => `${e.instancePath} ${e.message}`).join('; ');
      throw new Error(`Schema validation failed: ${errors}`);
    }
    return data;
  };
}

module.exports = { createSchemaGuard };
