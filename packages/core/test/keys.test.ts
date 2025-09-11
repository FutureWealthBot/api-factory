import { constantTimeEqual, validateKeyFormat, findKeyRecord } from '../src/keys';

test('constantTimeEqual true/false', () => {
  expect(constantTimeEqual('abc123DEF','abc123DEF')).toBe(true);
  expect(constantTimeEqual('a','b')).toBe(false);
  expect(constantTimeEqual(undefined as unknown as string,'a')).toBe(false);
});

test('validateKeyFormat', () => {
  expect(validateKeyFormat('ABCD1234-EFGH5678')).toBe(true);
  expect(validateKeyFormat('short')).toBe(false);
  expect(validateKeyFormat('invalid!chars')).toBe(false);
});

test('findKeyRecord', () => {
  const m = { 'K1': { key: 'K1', status: 'ok' } };
  expect(findKeyRecord(m, 'K1')?.status).toBe('ok');
  expect(findKeyRecord(m, 'NO') ).toBeNull();
});
