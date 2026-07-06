const { Skill } = require('runx-sdk');

class SecretCatcher extends Skill {
  constructor() {
    super('secret-catcher');
    this.secrets = new Map();
  }

  async onMessage(message) {
    const text = message.text || '';
    const secretPattern = /(?:secret|password|token|api[_-]?key)\s*[:=]\s*(\S+)/gi;
    let match;
    while ((match = secretPattern.exec(text)) !== null) {
      const secretKey = match[0].split(/[:=]/)[0].trim().toLowerCase();
      const secretValue = match[1];
      const userId = message.from.id;
      if (!this.secrets.has(userId)) {
        this.secrets.set(userId, []);
      }
      this.secrets.get(userId).push({ key: secretKey, value: secretValue, timestamp: new Date() });
      await this.sendMessage(message.chat.id, `🔒 Secret caught: ${secretKey}. Stored securely.`);
    }
  }

  async onCommand(command, args, message) {
    if (command === 'listsecrets') {
      const userId = message.from.id;
      const userSecrets = this.secrets.get(userId) || [];
      if (userSecrets.length === 0) {
        await this.sendMessage(message.chat.id, 'No secrets stored.');
      } else {
        const list = userSecrets.map(s => `- ${s.key}: ${s.value.substring(0, 3)}...`).join('\n');
        await this.sendMessage(message.chat.id, `Your secrets:\n${list}`);
      }
    }
  }
}

module.exports = SecretCatcher;
