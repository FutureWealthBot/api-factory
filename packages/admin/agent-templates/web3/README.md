# Web3/Hybrid Billing Templates

This directory contains starter templates for integrating Web3 and hybrid billing into your API service.

## Included
- `treasury-contract.sol`: Solidity smart contract for on-chain treasury and payment receipt.
- Example integration steps for Stripe + crypto payments.

## Integration Steps
1. Deploy `treasury-contract.sol` to your preferred EVM-compatible chain.
2. Add API endpoints to accept on-chain payments and verify receipts.
3. Enable hybrid billing: allow users to pay with Stripe or crypto.
4. Document payment flows in your OpenAPI spec.
