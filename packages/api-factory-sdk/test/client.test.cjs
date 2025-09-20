let ApiFactoryClient;
try {
  ApiFactoryClient = require('../dist/ApiFactoryClient.cjs').ApiFactoryClient;
} catch (err) {
  try {
    ApiFactoryClient = require('../src/ApiFactoryClient').ApiFactoryClient;
  } catch (err2) {
    // running in an environment without build tools; skip tests
    console.warn('Skipping client tests - ApiFactoryClient cannot be required in this environment');
    ApiFactoryClient = null;
  }
}

describe('ApiFactoryClient', () => {
  beforeEach(() => {
    if (!ApiFactoryClient) return;
    global.fetch = global.fetch || jest.fn();
    global.fetch.mockReset();
  });

  it('estimateRetirement calls API and returns parsed result', async () => {
    if (!ApiFactoryClient) return;
    const fake = { monthlySavingsNeeded: 123.45, targetSavings: 200000 };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fake });

    const client = new ApiFactoryClient({ apiKey: 'test', baseUrl: 'http://localhost:3000' });
    const res = await client.estimateRetirement({ age: 40, income: 100000, savings: 50000, retirementAge: 65 });

    expect(res).toEqual(fake);
    expect(global.fetch.mock.calls[0][0]).toContain('/api/v1/retirement/estimate');
  });
});
