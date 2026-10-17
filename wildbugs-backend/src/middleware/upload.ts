import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

/**
 * Supported image MIME types for observation capture.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/**
 * Maximum photo file size: 10 Megabytes.
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Multer in-memory storage engine.
 * Files are kept in memory as Buffer instances for streaming upload directly to Cloudinary.
 */
const storage = multer.memoryStorage();

/**
 * File filter rejecting non-image payloads.
 */
const fileFilter: multer.Options['fileFilter'] = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(
        `Invalid file type (${file.mimetype}). Only JPEG, PNG, and WebP images are accepted.`
      )
    );
  }
};

/**
 * Base configured Multer instance.
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * Express middleware that accepts a single photo upload under either 'photo' or 'image' field name.
 * Populates req.file with the uploaded Express.Multer.File instance.
 */
export const uploadSinglePhoto = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const uploadFields = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]);

  uploadFields(req, res, (err: unknown) => {
    if (err) {
      return next(err);
    }

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    if (files) {
      if (files.photo && files.photo.length > 0) {
        req.file = files.photo[0];
      } else if (files.image && files.image.length > 0) {
        req.file = files.image[0];
      }
    }

    next();
  });
};

export default upload;
