import { NanoNode } from '@nano-org/core';
import { BountyClaim } from '../types/bounty';

interface NanoConfig {
  node_url: string;
  account_seed: string;
}

class NanoPayoutService {
  private node: NanoNode;
  private config: NanoConfig;

  constructor(config: NanoConfig) {
    this.config = config;
    this.node = new NanoNode(config.node_url);
  }

  async sendXNO(receiverAddress: string, amount: number): Promise<string> {
    const account = this.node.accountFromSeed(this.config.account_seed);
    const transaction = account.createTransaction(receiverAddress, amount);
    const block = await this.node.processTransaction(transaction);
    return block.hash;
  }

  validateAddress(address: string): boolean {
    return this.node.isValidAddress(address);
  }
}

export default NanoPayoutService;