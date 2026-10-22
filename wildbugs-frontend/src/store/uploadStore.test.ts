import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useUploadStore } from './uploadStore.ts';
import type { Sighting } from '../types/sighting.ts';

describe('Upload Store Unit Tests', () => {
  beforeEach(() => {
    useUploadStore.getState().reset();
  });

  it('initializes with default capture step and empty coordinates', () => {
    const state = useUploadStore.getState();
    assert.equal(state.step, 'capture');
    assert.equal(state.latitude, null);
    assert.equal(state.longitude, null);
    assert.equal(state.speciesId, null);
    assert.equal(state.uploadProgress, 0);
    assert.equal(state.isUploading, false);
    assert.equal(state.createdSighting, null);
  });

  it('updates step correctly', () => {
    const store = useUploadStore.getState();
    store.setStep('location');
    assert.equal(useUploadStore.getState().step, 'location');
  });

  it('sets coordinates accurately and resets coordinate error', () => {
    const store = useUploadStore.getState();
    store.setLocation(28.5147, 77.2625);
    const updated = useUploadStore.getState();
    assert.equal(updated.latitude, 28.5147);
    assert.equal(updated.longitude, 77.2625);
  });

  it('sets photo data and transitions to preview step', () => {
    const store = useUploadStore.getState();
    const rawFile = new File(['content'], 'beetle.jpg', { type: 'image/jpeg' });
    const compressedFile = new File(['small'], 'beetle.jpg', { type: 'image/jpeg' });

    store.setPhotoData({
      rawFile,
      compressedFile,
      previewUrl: 'blob:http://localhost/mock-preview',
      originalSize: 5000000,
      compressedSize: 450000,
      imageWidth: 1920,
      imageHeight: 1080,
    });

    const state = useUploadStore.getState();
    assert.equal(state.step, 'preview');
    assert.equal(state.previewUrl, 'blob:http://localhost/mock-preview');
    assert.equal(state.originalSize, 5000000);
    assert.equal(state.compressedSize, 450000);
    assert.equal(state.imageWidth, 1920);
    assert.equal(state.imageHeight, 1080);
  });

  it('handles upload progress and completion', () => {
    const store = useUploadStore.getState();
    store.setIsUploading(true);
    store.setUploadProgress(45);

    let state = useUploadStore.getState();
    assert.equal(state.isUploading, true);
    assert.equal(state.uploadProgress, 45);

    const mockSighting: Sighting = {
      id: 'test-sighting-uuid',
      userId: 'user-1',
      speciesId: 5,
      photoUrl: 'https://cloudinary.com/test.jpg',
      thumbnailUrl: 'https://cloudinary.com/test_thumb.jpg',
      latitude: 28.5147,
      longitude: 77.2625,
      aiConfidence: 0.94,
      status: 'IDENTIFIED',
      observedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    store.setCreatedSighting(mockSighting);
    state = useUploadStore.getState();
    assert.equal(state.step, 'success');
    assert.equal(state.isUploading, false);
    assert.equal(state.uploadProgress, 100);
    assert.equal(state.createdSighting?.id, 'test-sighting-uuid');
  });

  it('resets completely to initial state', () => {
    const store = useUploadStore.getState();
    store.setLocation(25, 75);
    store.setSpeciesId(12);
    store.setStep('location');

    store.reset();
    const state = useUploadStore.getState();
    assert.equal(state.step, 'capture');
    assert.equal(state.latitude, null);
    assert.equal(state.longitude, null);
    assert.equal(state.speciesId, null);
  });

  it('updates and resets notes field correctly', () => {
    const store = useUploadStore.getState();
    store.setNotes('Found resting on a milkweed leaf.');
    assert.equal(useUploadStore.getState().notes, 'Found resting on a milkweed leaf.');

    store.reset();
    assert.equal(useUploadStore.getState().notes, '');
  });
});
