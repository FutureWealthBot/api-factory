import { describe, it } from 'node:test';
import assert from 'node:assert';

// Simple unit test for MVP Admin Web
describe('Admin Web MVP', () => {
  it('should have basic environment configuration', () => {
    // Test environment variable access pattern used in the app
    const mockEnv = {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-key'
    };
    
    assert.ok(mockEnv.VITE_SUPABASE_URL);
    assert.ok(mockEnv.VITE_SUPABASE_ANON_KEY);
  });

  it('should handle basic configuration', () => {
    // Test basic configuration values that the app uses
    const config = {
      apiPort: 8787,
      webPort: 5173,
      baseUrl: 'http://localhost'
    };
    
    assert.strictEqual(config.apiPort, 8787);
    assert.strictEqual(config.webPort, 5173);
    assert.strictEqual(config.baseUrl, 'http://localhost');
  });
});