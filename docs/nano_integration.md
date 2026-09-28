# Nano (XNO) Payout Integration Guide

## Overview
This guide provides instructions for integrating Nano (XNO) payouts into the Frantic agent-bounty board.

## Prerequisites
- A Nano node (e.g., [Nano Node API](https://docs.nano.org/api/)).
- A funded Nano account with sufficient XNO for payouts.

## Setup
1. **Configure Nano Service**
   Update `src/payments/payment_workflow.ts` with your Nano node URL and account seed:
   ```typescript
   const workflow = new PaymentWorkflow({
     node_url: 'https://api.nano.org',
     account_seed: 'YOUR_ACCOUNT_SEED'
   });
   ```

2. **Enable Nano Payouts**
   Add Nano to `config/payment_methods.json`:
   ```json
   {
     "supported_methods": ["crypto", "bank_transfer", "nano"],
     "nano": {
       "enabled": true
     }
   }
   ```

## Usage
- Claimants select "Nano (XNO)" as their preferred payment method.
- Provide a valid Nano address (e.g., `xrb_1abc2...`).
- Payouts are processed instantly with zero fees.

## Verification
- Transaction hashes are appended to bounty issues as receipts.
- Recipients can verify payouts using [Nano Explorer](https://nanexplorer.com).

## Security
- Store the account seed securely (e.g., environment variables).
- Use a dedicated Nano account for payouts.

## Limitations
- Nano is a single-chain solution. No cross-chain or smart contract support.
- Payouts are irreversible. Test with small amounts first.