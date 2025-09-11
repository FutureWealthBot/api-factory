"use strict";
const esm = require('./dist/index.js');
module.exports = {
  ok: esm.ok,
  err: esm.err,
  newRequestId: esm.newRequestId,
};
