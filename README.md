# Secret Catcher

A runx skill that catches and redacts secrets (API keys, tokens, passwords) from text output.

## Usage

```javascript
const secretCatcher = require('secret-catcher');
const result = secretCatcher({ text: 'Your API key is abc123def456ghi789' });
console.log(result.redacted);
// Output: Your API key is [REDACTED]
```

## Installation

This skill is intended to be used within the runx framework. Install via npm:

```bash
npm install secret-catcher
```

## License
MIT
