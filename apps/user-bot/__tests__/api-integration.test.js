// API integration tests with mocked responses
import { handleCommand } from '../index.js';

describe('API Integration Tests (Mocked)', () => {
  let fetchMock;

  beforeEach(() => {
    // Create a fresh mock for each test
    fetchMock = () => Promise.resolve({
      json: () => Promise.resolve({ default: 'response' })
    });
    global.fetch = fetchMock;
  });

  describe('API calls with various response scenarios', () => {
    it('should handle successful API responses', async () => {
      const mockResponse = { pong: true, timestamp: Date.now() };
      global.fetch = () => Promise.resolve({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await handleCommand(123456, '/ping');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API network errors gracefully', async () => {
      global.fetch = () => Promise.reject(new Error('Network error'));

      // The function should handle the error and not throw
      await expect(handleCommand(123456, '/ping')).rejects.toThrow('Network error');
    });

    it('should handle invalid JSON responses', async () => {
      global.fetch = () => Promise.resolve({
        json: () => Promise.reject(new Error('Unexpected token'))
      });

      const result = await handleCommand(123456, '/ping');
      expect(result).toEqual({ error: 'invalid-json' });
    });

    it('should handle empty JSON responses', async () => {
      global.fetch = () => Promise.resolve({
        json: () => Promise.resolve({})
      });

      const result = await handleCommand(123456, '/ping');
      expect(result).toEqual({});
    });
  });

  describe('Support message API integration', () => {
    it('should format support messages correctly', async () => {
      let calledUrl = '';
      let calledOptions = {};
      
      global.fetch = (url, options) => {
        calledUrl = url;
        calledOptions = options;
        return Promise.resolve({
          json: () => Promise.resolve({ sent: true })
        });
      };

      await handleCommand(987654321, '/support I need help with my account');

      expect(calledUrl).toBe('http://localhost:8787/api/v1/actions');
      expect(calledOptions.method).toBe('POST');
      expect(calledOptions.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(calledOptions.body)).toEqual({
        action: 'send_telegram_alert',
        payload: {
          chat_id: '123456789',
          message: '[support from 987654321] I need help with my account'
        }
      });
    });

    it('should handle API errors for support messages', async () => {
      global.fetch = () => Promise.resolve({
        json: () => Promise.reject(new Error('API Error'))
      });

      const result = await handleCommand(123456, '/support test message');
      expect(result).toEqual({ sent: true }); // Function still returns sent: true even on API error
    });
  });

  describe('API base URL configuration', () => {
    it('should use default API_BASE when not configured', async () => {
      let calledUrl = '';
      global.fetch = (url) => {
        calledUrl = url;
        return Promise.resolve({
          json: () => Promise.resolve({ pong: true })
        });
      };

      await handleCommand(123456, '/ping');

      expect(calledUrl).toBe('http://localhost:8787/api/v1/hello/ping');
    });
  });
});