// Flags: --no-harmony-temporal
'use strict';

require('../common');
const assert = require('node:assert');
const { it, describe } = require('node:test');

describe('Mock Timers Temporal.Now without Temporal', () => {
  it('should throw when Temporal.Now is explicitly requested', (t) => {
    assert.throws(() => {
      t.mock.timers.enable({ apis: ['Temporal.Now'] });
    }, { code: 'ERR_INVALID_ARG_VALUE' });
  });

  it('should silently exclude Temporal.Now from the default apis', (t) => {
    t.mock.timers.enable({ now: 0 });
    assert.strictEqual(Date.now(), 0);
  });
});
