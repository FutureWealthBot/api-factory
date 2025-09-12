// Expose the `jest` global when running tests under ESM (VM modules)
// This imports the `jest` object from @jest/globals and sets it on global.
const { jest: _jest } = require('@jest/globals');
global.jest = _jest;
