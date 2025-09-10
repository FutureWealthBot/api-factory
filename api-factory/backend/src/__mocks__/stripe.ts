// Minimal mock of the stripe package used by backend tests.
// Jest will pick this up when tests call `jest.mock('stripe')`.
const constructEvent = (_payload: Buffer, _sig: string, _secret: string) => ({
  type: 'invoice.payment_failed',
  data: { object: { metadata: { api_key: 'signed-key' } } }
});

export default class MockStripe {
  webhooks: { constructEvent: typeof constructEvent };
  constructor() {
    this.webhooks = { constructEvent };
  }
}

module.exports = MockStripe;
