import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageFile, formatFileSize } from './compressImage.ts';

describe('Client Image Utilities Unit Tests', () => {
  describe('formatFileSize', () => {
    it('returns 0 B for 0 or negative values', () => {
      assert.equal(formatFileSize(0), '0 B');
      assert.equal(formatFileSize(-100), '0 B');
      assert.equal(formatFileSize(Number.NaN), '0 B');
    });

    it('formats bytes correctly', () => {
      assert.equal(formatFileSize(500), '500 B');
      assert.equal(formatFileSize(1023), '1023 B');
    });

    it('formats kilobytes correctly', () => {
      assert.equal(formatFileSize(1024), '1 KB');
      assert.equal(formatFileSize(350 * 1024), '350 KB');
    });

    it('formats megabytes correctly', () => {
      assert.equal(formatFileSize(1024 * 1024), '1 MB');
      assert.equal(formatFileSize(4.5 * 1024 * 1024), '4.5 MB');
    });
  });

  describe('validateImageFile', () => {
    it('approves standard image/jpeg file within size limit', () => {
      const mockFile = new File(['dummy content'], 'insect.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(mockFile, 15);
      assert.equal(result.valid, true);
      assert.equal(result.error, undefined);
    });

    it('approves standard image/png and image/webp files', () => {
      const pngFile = new File(['dummy content'], 'mantis.png', { type: 'image/png' });
      assert.equal(validateImageFile(pngFile).valid, true);

      const webpFile = new File(['dummy content'], 'beetle.webp', { type: 'image/webp' });
      assert.equal(validateImageFile(webpFile).valid, true);
    });

    it('approves file with missing MIME type if extension is valid', () => {
      const extensionOnly = new File(['dummy content'], 'specimen.JPG', { type: '' });
      const result = validateImageFile(extensionOnly);
      assert.equal(result.valid, true);
    });

    it('rejects unsupported MIME types like application/pdf', () => {
      const pdfFile = new File(['dummy content'], 'report.pdf', { type: 'application/pdf' });
      const result = validateImageFile(pdfFile);
      assert.equal(result.valid, false);
      assert.match(result.error || '', /Unsupported format/i);
    });

    it('rejects unrecognized file type with no extension and no MIME type', () => {
      const binaryFile = new File(['dummy content'], 'corrupted', { type: '' });
      const result = validateImageFile(binaryFile);
      assert.equal(result.valid, false);
      assert.match(result.error || '', /Unrecognized file type/i);
    });

    it('rejects files exceeding max size limit', () => {
      const bigContent = new Uint8Array(2 * 1024 * 1024); // 2 MB
      const bigFile = new File([bigContent], 'giant_beetle.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(bigFile, 1); // 1 MB limit
      assert.equal(result.valid, false);
      assert.match(result.error || '', /exceeds the maximum allowed upload limit/i);
    });
  });
});
