import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/features/credits/pages/StorageBillingPage.tsx', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/services/storage.service.ts', import.meta.url), 'utf8');

test('platform-only storage pricing is hidden from academy users', () => {
  assert.match(page, /role === 'SUPER_ADMIN' \|\| role === 'SUPER_ADMIN_STAFF'/);
  assert.match(page, /\{isPlatformAdmin && <button/);
  assert.match(page, /\{activeTab === 'control-panel' && isPlatformAdmin && \(/);
  assert.match(page, /isPlatformAdmin \? storageService\.getControlPanelSettings/);
  assert.match(page, /if \(!isPlatformAdmin\) return;/);
});

test('storage rate form prevents invalid client submissions', () => {
  assert.match(page, /Number\.isFinite\(amount\)/);
  assert.match(page, /amount < 0/);
  assert.match(page, /cpErrorMsg/);
  assert.match(page, /Credits per GB per Metering Interval|Credit Rate per GB per Metering Interval/);
});

test('backend interval choices include 18 hours', () => {
  assert.match(service, /'18_HOURS'/);
  assert.match(page, /<option value="18_HOURS">18 Hours<\/option>/);
});
