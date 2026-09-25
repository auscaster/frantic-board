import NanoPayoutService from './nano_service';
import { BountyClaim } from '../types/bounty';

class PaymentWorkflow {
  private nanoService: NanoPayoutService | null = null;

  constructor(nanoConfig?: { node_url: string; account_seed: string }) {
    if (nanoConfig) {
      this.nanoService = new NanoPayoutService(nanoConfig);
    }
  }

  async processClaim(claim: BountyClaim): Promise<string> {
    if (claim.preferredPayment === 'nano' && this.nanoService) {
      if (!this.nanoService.validateAddress(claim.paymentAddress)) {
        throw new Error('Invalid Nano address');
      }
      const blockHash = await this.nanoService.sendXNO(
        claim.paymentAddress,
        claim.amount
      );
      return `Nano payout sent. Block hash: [${blockHash}](https://nanexplorer.com/block/${blockHash})`;
    }
    // Fallback to existing payment logic
    return this.fallbackPayment(claim);
  }

  private fallbackPayment(claim: BountyClaim): string {
    // Existing payment logic (e.g., crypto, bank transfer)
    return 'Fallback payment processed';
  }
}

export default PaymentWorkflow;