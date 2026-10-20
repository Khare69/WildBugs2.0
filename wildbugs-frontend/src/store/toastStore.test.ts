import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { useToastStore, toast } from './toastStore.ts';

describe('Toast Store Unit Tests', () => {
  test('initializes with an empty toast list and adds toast items', () => {
    useToastStore.getState().clearToasts();
    assert.equal(useToastStore.getState().toasts.length, 0);

    const id = useToastStore.getState().addToast('Test Message', 'success', 0);
    const toasts = useToastStore.getState().toasts;

    assert.equal(toasts.length, 1);
    assert.equal(toasts[0].id, id);
    assert.equal(toasts[0].message, 'Test Message');
    assert.equal(toasts[0].type, 'success');
  });

  test('removes toast by ID and clears all toasts', () => {
    useToastStore.getState().clearToasts();

    const id1 = useToastStore.getState().addToast('First', 'info', 0);
    const id2 = useToastStore.getState().addToast('Second', 'warning', 0);

    assert.equal(useToastStore.getState().toasts.length, 2);

    useToastStore.getState().removeToast(id1);
    let toasts = useToastStore.getState().toasts;
    assert.equal(toasts.length, 1);
    assert.equal(toasts[0].id, id2);

    useToastStore.getState().clearToasts();
    toasts = useToastStore.getState().toasts;
    assert.equal(toasts.length, 0);
  });

  test('dispatches toasts via global helper functions', () => {
    useToastStore.getState().clearToasts();

    toast.success('Saved successfully!', 0);
    toast.error('Operation failed!', 0);
    toast.info('Info notice', 0);
    toast.warning('Warning notice', 0);

    const toasts = useToastStore.getState().toasts;
    assert.equal(toasts.length, 4);
    assert.equal(toasts[0].type, 'success');
    assert.equal(toasts[1].type, 'error');
    assert.equal(toasts[2].type, 'info');
    assert.equal(toasts[3].type, 'warning');
  });
});
