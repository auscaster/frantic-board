// quoteGuard.js - runx skill for Frantic bounty #82
// Guards against quote spam and enforces rules.
/*
  Configuration options:
  - minLength: minimum characters for a quote (default 10)
  - maxLength: maximum characters for a quote (default 1000)
  - rateLimit: max quotes per minute per user (default 3)
  - duplicateCheck: whether to block duplicate quotes (default true)
*/

const rateLimits = new Map(); // userId -> { count, resetTime }
const recentQuotes = new Set(); // normalized content for duplicate check

function normalize(content) {
  return content.trim().toLowerCase().replace(/\s+/g, ' ');
}

function checkRateLimit(userId, maxQuotes, windowMs) {
  const now = Date.now();
  const record = rateLimits.get(userId);
  if (!record || now > record.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxQuotes) {
    return false;
  }
  record.count++;
  return true;
}

function isQuote(content) {
  // A quote is a message that starts with '> ' or is wrapped in blockquotes.
  // Extend this if needed.
  return content.startsWith('> ') || /^>/.test(content);
}

function validateQuote(content, options) {
  const { minLength, maxLength, duplicateCheck } = options;
  const normalized = normalize(content);
  if (normalized.length < minLength) {
    throw new Error(`Quote must be at least ${minLength} characters.`);
  }
  if (normalized.length > maxLength) {
    throw new Error(`Quote must be no more than ${maxLength} characters.`);
  }
  if (duplicateCheck && recentQuotes.has(normalized)) {
    throw new Error('This quote has already been posted recently.');
  }
  return true;
}

/**
 * Guards a message as a quote.
 * @param {Object} message - The message object from the chat platform (must have content, author.id, author.username)
 * @param {Object} config - Optional configuration overrides
 * @returns {Object} { allowed: boolean, reason?: string }
 */
function guard(message, config = {}) {
  const options = {
    minLength: config.minLength || 10,
    maxLength: config.maxLength || 1000,
    rateLimit: config.rateLimit || 3,
    rateWindowMs: config.rateWindowMs || 60000, // 1 minute
    duplicateCheck: config.duplicateCheck !== undefined ? config.duplicateCheck : true,
  };

  if (!message || !message.content) {
    return { allowed: false, reason: 'No content provided.' };
  }

  // Only guard if it looks like a quote
  if (!isQuote(message.content)) {
    return { allowed: true }; // Not a quote, skip guard
  }

  // Rate limit check
  if (!checkRateLimit(message.author.id, options.rateLimit, options.rateWindowMs)) {
    return { allowed: false, reason: 'You are sending quotes too fast. Please slow down.' };
  }

  // Validate content
  try {
    validateQuote(message.content, options);
  } catch (err) {
    return { allowed: false, reason: err.message };
  }

  // Record duplicate
  if (options.duplicateCheck) {
    recentQuotes.add(normalize(message.content));
    // Optional: limit the set size to avoid memory leak
    if (recentQuotes.size > 10000) {
      const first = recentQuotes.values().next().value;
      recentQuotes.delete(first);
    }
  }

  return { allowed: true };
}

module.exports = guard;
