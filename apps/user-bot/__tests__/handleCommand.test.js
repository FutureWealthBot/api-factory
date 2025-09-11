// Unit tests for user-bot handleCommand function
import { handleCommand } from '../index.js';

describe('handleCommand', () => {
  let fetchMock;

  beforeEach(() => {
    // Create a fresh mock for each test
    fetchMock = () => Promise.resolve({
      json: () => Promise.resolve({ default: 'response' })
    });
    global.fetch = fetchMock;
  });

  describe('/help command', () => {
    it('should return help text', async () => {
      const result = await handleCommand(123456, '/help');
      expect(result).toEqual({
        help: 'Available: /help /ping /echo <text> /support <message>'
      });
    });
  });

  describe('/echo command', () => {
    it('should echo the provided text', async () => {
      const result = await handleCommand(123456, '/echo hello world');
      expect(result).toEqual({
        echo: 'hello world'
      });
    });

    it('should handle empty echo text', async () => {
      const result = await handleCommand(123456, '/echo');
      expect(result).toEqual({
        echo: ''
      });
    });
  });

  describe('/ping command', () => {
    it('should call API ping endpoint', async () => {
      const mockResponse = { pong: true };
      let calledUrl = '';
      let calledOptions = {};
      
      global.fetch = (url, options) => {
        calledUrl = url;
        calledOptions = options;
        return Promise.resolve({
          json: () => Promise.resolve(mockResponse)
        });
      };

      const result = await handleCommand(123456, '/ping');
      
      expect(calledUrl).toBe('http://localhost:8787/api/v1/hello/ping');
      expect(calledOptions).toEqual({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API ping failure', async () => {
      global.fetch = () => Promise.resolve({
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await handleCommand(123456, '/ping');
      expect(result).toEqual({ error: 'invalid-json' });
    });
  });

  describe('/support command', () => {
    it('should send support message to admin', async () => {
      let calledUrl = '';
      let calledOptions = {};
      
      global.fetch = (url, options) => {
        calledUrl = url;
        calledOptions = options;
        return Promise.resolve({
          json: () => Promise.resolve({ success: true })
        });
      };

      const result = await handleCommand(123456, '/support help me please');

      expect(calledUrl).toBe('http://localhost:8787/api/v1/actions');
      expect(calledOptions.method).toBe('POST');
      expect(calledOptions.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(calledOptions.body)).toEqual({
        action: 'send_telegram_alert',
        payload: {
          chat_id: '123456789',
          message: '[support from 123456] help me please'
        }
      });
      expect(result).toEqual({ sent: true });
    });

    it('should return error for empty support message', async () => {
      const result = await handleCommand(123456, '/support');
      expect(result).toEqual({
        error: 'usage: /support <message>'
      });
    });

    it('should return error for support command with only whitespace', async () => {
      const result = await handleCommand(123456, '/support   ');
      expect(result).toEqual({
        error: 'usage: /support <message>'
      });
    });
  });

  describe('unknown command', () => {
    it('should return error for unknown command', async () => {
      const result = await handleCommand(123456, '/unknown');
      expect(result).toEqual({
        error: 'unknown_command',
        help: 'Use /help'
      });
    });

    it('should handle empty text input', async () => {
      const result = await handleCommand(123456, '');
      expect(result).toEqual({
        error: 'unknown_command',
        help: 'Use /help'
      });
    });

    it('should handle null text input', async () => {
      const result = await handleCommand(123456, null);
      expect(result).toEqual({
        error: 'unknown_command',
        help: 'Use /help'
      });
    });
  });
});