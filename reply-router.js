/**
 * runx skill: reply router
 * Routes incoming messages to appropriate handlers based on intent/pattern.
 */

'use strict';

class ReplyRouter {
  constructor() {
    this.handlers = [];
  }

  /**
   * Register a handler for a specific intent or pattern.
   * @param {string|RegExp} pattern - The pattern to match.
   * @param {Function} handler - Function that takes (message, context) and returns reply string or promise.
   */
  addHandler(pattern, handler) {
    this.handlers.push({ pattern, handler });
  }

  /**
   * Route a message to the first matching handler.
   * @param {string} message - The incoming message text.
   * @param {object} context - Additional context (user info, etc.).
   * @returns {Promise<string>} - The reply.
   */
  async route(message, context) {
    for (const entry of this.handlers) {
      if (this._matches(entry.pattern, message)) {
        return await entry.handler(message, context);
      }
    }
    // Default fallback
    return "I'm sorry, I didn't understand that.";
  }

  /**
   * Check if a pattern matches a message.
   * @private
   */
  _matches(pattern, message) {
    if (typeof pattern === 'string') {
      return message.toLowerCase().includes(pattern.toLowerCase());
    } else if (pattern instanceof RegExp) {
      return pattern.test(message);
    }
    return false;
  }
}

module.exports = ReplyRouter;
