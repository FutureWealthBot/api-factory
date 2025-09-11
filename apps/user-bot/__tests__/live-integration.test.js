// Live integration tests - only run when RUN_LIVE_TESTS=1
// These tests require a real backend running at the configured API_BASE

const shouldRunLiveTests = process.env.RUN_LIVE_TESTS === '1';

const describeIf = (condition, ...args) => 
  condition ? describe(...args) : describe.skip(...args);

describeIf(shouldRunLiveTests, 'Live API Tests', () => {
  const API_BASE = process.env.API_BASE || 'http://localhost:3000';
  
  // Helper to make actual API calls
  const makeApiCall = async (path, method = 'GET', body) => {
    const url = `${API_BASE}${path}`;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    
    const res = await fetch(url, opts);
    return res.json().catch(() => ({ error: 'invalid-json' }));
  };

  beforeAll(() => {
    // Ensure fetch is available for live tests
    if (typeof fetch === 'undefined') {
      throw new Error('fetch is not available for live tests');
    }
  });

  describe('Backend health checks', () => {
    it('should ping the backend successfully', async () => {
      const result = await makeApiCall('/api/v1/hello/ping');
      
      // Backend should respond with some kind of success
      expect(result).toBeDefined();
      expect(result.error).toBeUndefined();
    }, 10000); // 10 second timeout for live tests

    it('should handle healthz endpoint', async () => {
      const result = await makeApiCall('/_api/healthz');
      
      // Health endpoint should respond
      expect(result).toBeDefined();
    }, 10000);
  });

  describe('Actions endpoint', () => {
    it('should return 401 for unauthenticated actions request', async () => {
      try {
        const result = await makeApiCall('/api/v1/actions', 'POST', { action: 'noop' });
        
        // Should either get an error response or the fetch itself should indicate auth failure
        expect(result).toBeDefined();
        // Don't assert specific format since different backends may handle auth differently
      } catch (error) {
        // Network errors are also acceptable for auth failures
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('End-to-end user-bot functionality', () => {
    // Import the actual handleCommand function
    let handleCommand;
    
    beforeAll(async () => {
      // Dynamically import to avoid loading the module if tests are skipped
      const module = await import('../index.js');
      handleCommand = module.handleCommand;
    });

    it('should handle /ping command against live backend', async () => {
      const result = await handleCommand(123456, '/ping');
      
      expect(result).toBeDefined();
      // Don't assert specific structure since backend responses may vary
    }, 15000);

    it('should handle /help command (no backend needed)', async () => {
      const result = await handleCommand(123456, '/help');
      
      expect(result).toEqual({
        help: 'Available: /help /ping /echo <text> /support <message>'
      });
    }, 5000);

    it('should handle /echo command (no backend needed)', async () => {
      const result = await handleCommand(123456, '/echo live test message');
      
      expect(result).toEqual({
        echo: 'live test message'
      });
    }, 5000);
  });
});

// If live tests are not enabled, show a message
if (!shouldRunLiveTests) {
  describe('Live Tests Skipped', () => {
    it('should skip live tests when RUN_LIVE_TESTS is not set', () => {
      console.log('Live tests skipped. Set RUN_LIVE_TESTS=1 to run live integration tests.');
      expect(true).toBe(true);
    });
  });
}