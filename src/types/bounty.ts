export interface BountyClaim {
  id: string;
  amount: number;
  preferredPayment: 'crypto' | 'bank_transfer' | 'nano';
  paymentAddress: string; // Nano address if preferredPayment === 'nano'
  status: 'pending' | 'completed';
  receipt?: string; // Block hash for Nano payouts
}