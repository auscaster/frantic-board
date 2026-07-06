const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

class CompliancePack {
  constructor() {
    this.rules = [];
    this.loadRules();
  }

  loadRules() {
    const rulesPath = path.join(__dirname, 'compliance-rules.yaml');
    if (fs.existsSync(rulesPath)) {
      const raw = fs.readFileSync(rulesPath, 'utf8');
      const parsed = yaml.load(raw);
      this.rules = parsed.rules || [];
    }
  }

  async checkCompliance(context) {
    const results = [];
    for (const rule of this.rules) {
      try {
        if (rule.pattern) {
          // Check files for pattern
          const files = context.files || [];
          for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            if (new RegExp(rule.pattern).test(content)) {
              results.push({
                rule: rule.id,
                severity: rule.severity,
                message: `Found pattern in ${file}`,
                pass: false
              });
            }
          }
        } else if (rule.command) {
          // Run command and check exit code
          execSync(rule.command, { cwd: context.workspace, stdio: 'pipe' });
          results.push({ rule: rule.id, severity: rule.severity, message: 'Passed', pass: true });
        }
      } catch (err) {
        results.push({ rule: rule.id, severity: rule.severity, message: err.message, pass: false });
      }
    }
    return results;
  }
}

module.exports = new CompliancePack();
