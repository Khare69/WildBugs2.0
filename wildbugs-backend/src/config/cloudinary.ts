import { v2 as cloudinary } from 'cloudinary';
import env from './env';

/**
 * Configure Cloudinary v2 SDK instance.
 * Credentials are read securely from environment variables.
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Helper to verify whether valid Cloudinary credentials are configured.
 */
export const isCloudinaryConfigured = (): boolean => {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  return Boolean(cloudName && apiKey && apiSecret);
};

export default cloudinary;
