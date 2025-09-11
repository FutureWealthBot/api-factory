import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ok, err, newRequestId } from './index.js';

// Unit tests for MVP Core package
describe('Core MVP', () => {
  describe('API Response Helpers', () => {
    it('should create success response with ok()', () => {
      const requestId = newRequestId();
      const result = ok({ message: 'test' }, requestId);
      
      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.data, { message: 'test' });
      assert.strictEqual(result.error, null);
      assert.strictEqual(result.meta.request_id, requestId);
    });

    it('should create error response with err()', () => {
      const requestId = newRequestId();
      const result = err('TEST_ERROR', 'Test error message', requestId);
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.data, null);
      assert.strictEqual(result.error.code, 'TEST_ERROR');
      assert.strictEqual(result.error.message, 'Test error message');
      assert.strictEqual(result.meta.request_id, requestId);
    });

    it('should generate unique request IDs', () => {
      const id1 = newRequestId();
      const id2 = newRequestId();
      
      assert.strictEqual(typeof id1, 'string');
      assert.strictEqual(typeof id2, 'string');
      assert.notStrictEqual(id1, id2);
      assert.ok(id1.length > 0);
      assert.ok(id2.length > 0);
    });

    it('should handle error with details', () => {
      const requestId = newRequestId();
      const details = { field: 'username', value: 'invalid' };
      const result = err('VALIDATION_ERROR', 'Invalid input', requestId, details);
      
      assert.deepStrictEqual(result.error.details, details);
    });
  });
});