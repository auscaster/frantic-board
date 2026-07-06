/**
 * Secret Catcher - runx skill
 * Scans text for common secret patterns (API keys, tokens, passwords) and redacts them.
 */

const secretPatterns = [
  /(?<=api[_-]?key[\s:=]+)(['"]?)([a-zA-Z0-9_\-]{16,64})\1/gi,
  /(?<=secret[\s:=]+)(['"]?)([a-zA-Z0-9_\-]{8,64})\1/gi,
  /(?<=password[\s:=]+)(['"]?)([^"'\s]{6,})\1/gi,
  /(?<=token[\s:=]+)(['"]?)([a-zA-Z0-9_\-]{8,})\1/gi,
  /(?<=Bearer\s+)[a-zA-Z0-9_\-.:=]+/gi
];

/**
 * Redact secrets in a string.
 * @param {string} input - The text to scan.
 * @returns {string} - Text with secrets replaced by '[REDACTED]'.
 */
function redactSecrets(input) {
  let output = input;
  for (const pattern of secretPatterns) {
    output = output.replace(pattern, (match, quote, secret) => {
      // Keep quote if present
      if (quote) return quote + '[REDACTED]' + quote;
      return '[REDACTED]';
    });
  }
  return output;
}

/**
 * Main skill function. Accepts input object with 'text' property.
 * @param {object} input - { text: string }
 * @returns {object} - { redacted: string }
 */
function secretCatcher(input) {
  if (typeof input !== 'object' || typeof input.text !== 'string') {
    throw new Error('Input must be an object with a "text" property.');
  }
  return { redacted: redactSecrets(input.text) };
}

module.exports = secretCatcher;
