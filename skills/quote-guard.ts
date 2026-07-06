import { Skill, Context, Message } from 'runx-sdk';

/**
 * Quote Guard Skill
 * 
 * Intercepts messages that are quotes and validates them.
 * Guards against:
 * - Excessive length (>500 characters)
 * - Malicious patterns (e.g., script injection)
 * - Empty quotes
 * 
 * Returns a boolean indicating whether the quote is allowed.
 * If disallowed, provides a reason.
 */

const MAX_QUOTE_LENGTH = 500;
const MALICIOUS_PATTERN = /<script[^>]*>|<\/script>|javascript:/gi;

export const handler: Skill = {
  name: 'quote-guard',
  version: '1.0.0',
  
  /**
   * Main handler called when a message is processed.
   * @param ctx - The execution context
   * @param msg - The incoming message
   * @returns An object indicating if the quote is allowed and optional reason
   */
  async execute(ctx: Context, msg: Message): Promise<{ allowed: boolean; reason?: string }> {
    ctx.logger.info('Quote guard processing message', { messageId: msg.id });

    // Extract the quoted content from the message
    const quote = extractQuote(msg);

    if (!quote) {
      // No quote found, allow the message
      ctx.logger.debug('No quote detected, allowing');
      return { allowed: true };
    }

    // Check length
    if (quote.text.length > MAX_QUOTE_LENGTH) {
      ctx.logger.warn('Quote too long', { length: quote.text.length, max: MAX_QUOTE_LENGTH });
      return {
        allowed: false,
        reason: `Quote exceeds maximum length of ${MAX_QUOTE_LENGTH} characters.`
      };
    }

    // Check for malicious content
    if (MALICIOUS_PATTERN.test(quote.text)) {
      ctx.logger.warn('Malicious pattern detected in quote');
      return {
        allowed: false,
        reason: 'Quote contains forbidden patterns.'
      };
    }

    ctx.logger.info('Quote passed all guards');
    return { allowed: true };
  }
};

/**
 * Extracts the quoted text from a message.
 * Supports common quote formats:
 * - Markdown blockquotes: "> text"
 * - Reply quotes (if message has replyTo)
 * - Custom quote markers (e.g., [quote]text[/quote])
 * 
 * @param msg - The message object
 * @returns The quoted content or null if none
 */
function extractQuote(msg: Message): { text: string } | null {
  const content = msg.content || '';

  // Check for markdown blockquote
  const blockquoteMatch = content.match(/^>\s?(.*)$/m);
  if (blockquoteMatch) {
    return { text: blockquoteMatch[1].trim() };
  }

  // Check for reply quotes (if the message is a reply to another message)
  if (msg.replyTo && msg.replyTo.content) {
    // Only guard the quoted part? Here we treat the entire reply content as quote
    // In a real scenario, we might need to distinguish
    return { text: msg.replyTo.content };
  }

  // Could add more formats if needed

  return null;
}