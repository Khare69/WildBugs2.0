import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getVerificationStatusConfig,
  canPerformExpertVerification,
} from './expertVerificationUtils.ts';

describe('Expert Verification Logic Unit Tests', () => {
  it('maps VERIFIED status to expert badge configuration', () => {
    const config = getVerificationStatusConfig('VERIFIED');
    assert.equal(config.label, 'Expert Verified');
    assert.equal(config.icon, '🛡️');
    assert.equal(config.themeClass, 'verify-badge--verified');
    assert.match(config.description, /credentialed entomologist/i);
  });

  it('maps REJECTED status to warning badge configuration', () => {
    const config = getVerificationStatusConfig('REJECTED');
    assert.equal(config.label, 'Observation Rejected');
    assert.equal(config.icon, '⚠️');
    assert.equal(config.themeClass, 'verify-badge--rejected');
    assert.match(config.description, /deemed unidentifiable/i);
  });

  it('maps IDENTIFIED status to community/AI review configuration', () => {
    const config = getVerificationStatusConfig('IDENTIFIED');
    assert.equal(config.label, 'Community / AI Identified');
    assert.equal(config.icon, '🔍');
    assert.equal(config.themeClass, 'verify-badge--identified');
    assert.match(config.description, /awaiting expert review/i);
  });

  it('maps PENDING status to queue waiting configuration', () => {
    const config = getVerificationStatusConfig('PENDING');
    assert.equal(config.label, 'Pending Analysis');
    assert.equal(config.icon, '⏳');
    assert.equal(config.themeClass, 'verify-badge--pending');
  });

  it('correctly evaluates expert and admin authority', () => {
    assert.equal(canPerformExpertVerification('EXPERT'), true);
    assert.equal(canPerformExpertVerification('expert'), true);
    assert.equal(canPerformExpertVerification('ADMIN'), true);
    assert.equal(canPerformExpertVerification('admin'), true);

    assert.equal(canPerformExpertVerification('USER'), false);
    assert.equal(canPerformExpertVerification('user'), false);
    assert.equal(canPerformExpertVerification(''), false);
    assert.equal(canPerformExpertVerification(null), false);
    assert.equal(canPerformExpertVerification(undefined), false);
  });
});
