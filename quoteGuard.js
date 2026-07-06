/**
 * quoteGuard - Escapes single and double quotes in a string.
 * @param {string} input - The string to guard.
 * @returns {string} - The string with quotes escaped.
 */
function quoteGuard(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  return input.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

module.exports = quoteGuard;
