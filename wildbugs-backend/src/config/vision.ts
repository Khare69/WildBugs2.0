import { ImageAnnotatorClient } from '@google-cloud/vision';

/**
 * Checks if Google Cloud Vision credentials or key file are present.
 */
export const isVisionConfigured = (): boolean => {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_CLOUD_VISION_API_KEY ||
    process.env.GOOGLE_VISION_PRIVATE_KEY
  );
};

/**
 * Google Cloud Vision ImageAnnotatorClient instance.
 * Initialized only when credentials are provided in the environment.
 */
let clientInstance: ImageAnnotatorClient | null = null;

export const getVisionClient = (): ImageAnnotatorClient | null => {
  if (!isVisionConfigured()) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = new ImageAnnotatorClient();
    } catch (err) {
      console.warn('⚠️ [Vision Config Warning] Failed to instantiate Google Cloud Vision client:', err);
      return null;
    }
  }

  return clientInstance;
};

export default getVisionClient;
