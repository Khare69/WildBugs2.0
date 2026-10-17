import { Readable } from 'stream';
import { UploadApiResponse } from 'cloudinary';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { InternalServerError } from '../utils/errors';

export interface UploadImageResult {
  url: string;
  thumbnailUrl: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

export class ImageService {
  /**
   * Uploads an image buffer to Cloudinary and generates a 300x300 thumbnail URL.
   *
   * @param buffer Image data in memory
   * @param folder Cloudinary folder (default: 'wildbugs/sightings')
   * @returns {Promise<UploadImageResult>} Original secure URL, 300x300 thumbnail URL, and publicId
   */
  public async uploadImage(
    buffer: Buffer,
    folder = 'wildbugs/sightings'
  ): Promise<UploadImageResult> {
    // Graceful offline / test fallback if Cloudinary credentials are not configured
    if (!isCloudinaryConfigured()) {
      const mockId = `${folder}/mock_${Date.now()}`;
      return {
        url: `https://res.cloudinary.com/wildbugs-dev/image/upload/v1/${mockId}.jpg`,
        thumbnailUrl: `https://res.cloudinary.com/wildbugs-dev/image/upload/c_fill,h_300,w_300/v1/${mockId}.jpg`,
        publicId: mockId,
        format: 'jpg',
        bytes: buffer.length,
      };
    }

    return new Promise<UploadImageResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          eager: [{ width: 300, height: 300, crop: 'fill', gravity: 'auto' }],
          eager_async: false,
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            console.error('[Cloudinary Upload Error]:', error);
            return reject(
              new InternalServerError(
                'Failed to upload observation image to cloud storage',
                error?.message
              )
            );
          }

          // Generate optimized thumbnail URL via Cloudinary URL transformation
          const thumbnailUrl =
            result.eager && result.eager.length > 0
              ? result.eager[0].secure_url
              : cloudinary.url(result.public_id, {
                  width: 300,
                  height: 300,
                  crop: 'fill',
                  gravity: 'auto',
                  secure: true,
                });

          resolve({
            url: result.secure_url,
            thumbnailUrl,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );

      // Pipe buffer through readable stream
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Deletes an image from Cloudinary by its public ID.
   */
  public async deleteImage(publicId: string): Promise<boolean> {
    if (!isCloudinaryConfigured()) {
      return true;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (err) {
      console.warn(`[ImageService] Failed to delete image with public ID ${publicId}:`, err);
      return false;
    }
  }
}

export const imageService = new ImageService();
export default imageService;
