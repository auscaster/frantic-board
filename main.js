const rules = require('./rules.yaml');

async function run(context) {
  const results = [];
  for (const rule of rules.rules) {
    const checkFn = require(`./checks/${rule.check}`);
    const result = await checkFn(context);
    results.push({
      ruleId: rule.id,
      description: rule.description,
      severity: rule.severity,
      passed: result.passed,
      message: result.message
    });
  }
  return { compliance: results };
}

module.exports = { run };