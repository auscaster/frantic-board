const assert = require('assert');
const main = require('../main');

describe('Compliance Pack', function() {
  it('should return compliance results for given context', async function() {
    const context = {
      accessControl: { enabled: true },
      encryption: { atRest: true, inTransit: false },
      auditLogging: { enabled: true },
      patching: { upToDate: false }
    };
    const result = await main.run(context);
    assert.strictEqual(result.compliance.length, 4);
    assert.strictEqual(result.compliance[0].passed, true);
    assert.strictEqual(result.compliance[1].passed, false);
    assert.strictEqual(result.compliance[2].passed, true);
    assert.strictEqual(result.compliance[3].passed, false);
  });
});