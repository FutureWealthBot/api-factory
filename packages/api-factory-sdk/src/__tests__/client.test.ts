import { ApiFactoryClient } from '../ApiFactoryClient';

// Simple fetch mock
globalThis.fetch = (globalThis.fetch as any) || jest.fn();

describe('ApiFactoryClient', () => {
  beforeEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  it('estimateRetirement calls API and returns parsed result', async () => {
    const fake = { monthlySavingsNeeded: 123.45, targetSavings: 200000 };
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => fake });

    const client = new ApiFactoryClient({ apiKey: 'test', baseUrl: 'http://localhost:3000' });
    const res = await client.estimateRetirement({ age: 40, income: 100000, savings: 50000, retirementAge: 65 });

    expect(res).toEqual(fake);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/v1/retirement/estimate');
  });
});
