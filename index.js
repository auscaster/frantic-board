module.exports = {
  name: 'support-desk',
  description: 'Provides support desk assistance',
  /**
   * Handle incoming messages
   * @param {Object} ctx - Runx context
   * @param {Object} ctx.message - The incoming message
   * @param {Function} ctx.reply - Reply function
   */
  async handler(ctx) {
    const { message, reply } = ctx;
    const text = message.text?.toLowerCase() || '';

    if (text.includes('help') || text.includes('support') || text.includes('contact')) {
      await reply('Welcome to the support desk! How can I assist you today? Please describe your issue, and if needed, I will escalate to a human agent.');
    } else {
      await reply('I am here to help with support-related questions. If you need assistance, please ask for "help", "support", or "contact".');
    }
  }
};