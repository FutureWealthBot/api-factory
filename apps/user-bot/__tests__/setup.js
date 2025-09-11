// Jest setup file for user-bot tests
// This file is loaded before each test file

// Mock environment variables for testing
process.env.TELEGRAM_USER_BOT_TOKEN = process.env.TELEGRAM_USER_BOT_TOKEN || 'test-token-123';
process.env.API_BASE = process.env.API_BASE || 'http://localhost:8787';
process.env.TELEGRAM_ADMIN_CHAT_IDS = process.env.TELEGRAM_ADMIN_CHAT_IDS || '123456789';
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Mock console methods for cleaner test output
  console.log = () => {};
  console.error = () => {};
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});