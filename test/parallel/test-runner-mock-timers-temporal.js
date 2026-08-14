'use strict';

const common = require('../common');
const assert = require('node:assert');
const { it, describe } = require('node:test');

if (!common.hasTemporal) {
  common.skip('No Temporal support');
}

describe('Mock Timers Temporal.Now Test Suite', () => {
  it('should return the initial time from Temporal.Now.instant', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 100 });
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, 100);
  });

  it('should return an actual Temporal.Instant instance', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'] });
    assert.ok(Temporal.Now.instant() instanceof Temporal.Instant);
  });

  it('should accept a Date object as the initial time', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: new Date(200) });
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, 200);
  });

  it('should advance with tick', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 0 });
    t.mock.timers.tick(200);
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, 200);
  });

  it('should move with setTime', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 100 });
    t.mock.timers.setTime(1000);
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, 1000);
  });

  it('should share the mock clock with Date', (t) => {
    t.mock.timers.enable({ apis: ['Date', 'Temporal.Now'], now: 100 });
    t.mock.timers.tick(200);
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, Date.now());
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, 300);
  });

  it('should be mocked by a parameterless enable', (t) => {
    t.mock.timers.enable();
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, 0);
  });

  it('should have zero sub-millisecond digits', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 1 });
    assert.strictEqual(Temporal.Now.instant().epochNanoseconds, 1_000_000n);
  });

  it('should not mock timeZoneId', (t) => {
    const realTimeZoneId = Temporal.Now.timeZoneId();
    t.mock.timers.enable({ apis: ['Temporal.Now'] });
    assert.strictEqual(Temporal.Now.timeZoneId(), realTimeZoneId);
  });

  it('should use the mock clock for zonedDateTimeISO', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 0 });
    const zdt = Temporal.Now.zonedDateTimeISO('UTC');
    assert.strictEqual(zdt.epochMilliseconds, 0);
    assert.strictEqual(zdt.year, 1970);
    assert.strictEqual(zdt.timeZoneId, 'UTC');
  });

  it('should default zonedDateTimeISO to the system time zone', (t) => {
    const realTimeZoneId = Temporal.Now.timeZoneId();
    t.mock.timers.enable({ apis: ['Temporal.Now'] });
    assert.strictEqual(
      Temporal.Now.zonedDateTimeISO().timeZoneId, realTimeZoneId);
  });

  it('should derive plainDateTimeISO from the mock clock', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 0 });
    assert.strictEqual(
      Temporal.Now.plainDateTimeISO('UTC').toString(), '1970-01-01T00:00:00');
  });

  it('should derive plainDateISO from the mock clock', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 0 });
    assert.strictEqual(
      Temporal.Now.plainDateISO('UTC').toString(), '1970-01-01');
  });

  it('should derive plainTimeISO from the mock clock', (t) => {
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 0 });
    assert.strictEqual(
      Temporal.Now.plainTimeISO('UTC').toString(), '00:00:00');
  });

  it('should restore the real methods on reset', (t) => {
    const realInstant = Temporal.Now.instant;
    const realZonedDateTimeISO = Temporal.Now.zonedDateTimeISO;
    t.mock.timers.enable({ apis: ['Temporal.Now'] });
    assert.notStrictEqual(Temporal.Now.instant, realInstant);
    t.mock.timers.reset();
    assert.strictEqual(Temporal.Now.instant, realInstant);
    assert.strictEqual(Temporal.Now.zonedDateTimeISO, realZonedDateTimeISO);
  });

  it('should not be affected by a tampered global Temporal', (t) => {
    const realFromEpochMilliseconds = Temporal.Instant.fromEpochMilliseconds;
    t.after(() => {
      Temporal.Instant.fromEpochMilliseconds = realFromEpochMilliseconds;
    });

    Temporal.Instant.fromEpochMilliseconds = common.mustNotCall();
    t.mock.timers.enable({ apis: ['Temporal.Now'], now: 100 });
    assert.strictEqual(Temporal.Now.instant().epochMilliseconds, 100);
  });
});
