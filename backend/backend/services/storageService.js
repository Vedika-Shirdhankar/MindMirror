// services/storageService.js
// Abstracts all file system operations for uploaded media.
// Currently backed by local disk, but the interface is designed so that
// swapping to S3 / GCS requires only changing this file.
//
// Interview discussion: "Open/Closed Principle — the StorageService is open
// for extension (new backends) but closed for modification by callers."

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const logger = require('../utils/logger');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

/**
 * Returns a configured Multer instance for video uploads.
 * Field name must be "video".
 */
function createVideoUploader() {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.webm';
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `video-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    const isVideoMime = file.mimetype && file.mimetype.startsWith('video/');
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideoExt = ['.webm', '.mp4', '.mov', '.avi', '.mkv', '.ogv'].includes(ext);

    if (isVideoMime || isVideoExt || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only video files are allowed.`), false);
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_BYTES } });
}

/**
 * Deletes a file by its stored path or a relative URL like /uploads/video-xxx.mp4.
 * Fails silently to avoid breaking API responses on cleanup errors.
 */
function deleteFile(urlOrPath) {
  try {
    let filePath = urlOrPath;
    if (urlOrPath.startsWith('/uploads/')) {
      const filename = urlOrPath.split('/').pop();
      filePath = path.join(UPLOADS_DIR, filename);
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info({ message: 'File deleted', filePath });
    }
  } catch (err) {
    logger.warn({ message: 'Failed to delete file', urlOrPath, error: err.message });
  }
}

/**
 * Resolves a URL like /uploads/video-xxx.mp4 to an absolute filesystem path.
 */
function resolveUploadPath(urlOrFilename) {
  const filename = urlOrFilename.startsWith('/uploads/')
    ? urlOrFilename.split('/').pop()
    : path.basename(urlOrFilename);
  return path.join(UPLOADS_DIR, filename);
}

// --- Cloudinary Integration ---
const cloudinary = require('cloudinary').v2;
const config = require('../config');

if (config.cloudinaryUrl) {
  cloudinary.config({
    cloudinary_url: config.cloudinaryUrl,
  });
}

/**
 * Uploads a local file to Cloudinary.
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadToCloudinary(localFilePath) {
  if (!config.cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL is not configured.');
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      localFilePath,
      {
        resource_type: 'video',
        folder: 'mindmirror_videos',
      },
      (error, result) => {
        if (error) {
          logger.error({ message: 'Cloudinary upload_large error', error: error.message });
          return reject(error);
        }
        if (!result || (!result.secure_url && !result.url)) {
          return reject(new Error('Cloudinary response missing URL'));
        }
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
        });
      }
    );
  });
}

/**
 * Deletes a video from Cloudinary by its public ID.
 */
async function deleteFromCloudinary(publicId) {
  if (!config.cloudinaryUrl) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    logger.info({ message: 'Deleted from Cloudinary', publicId });
  } catch (err) {
    logger.warn({ message: 'Failed to delete from Cloudinary', publicId, error: err.message });
  }
}

/**
 * Downloads a video from Cloudinary to a local temporary file for Gemini analysis.
 * @returns {Promise<string>} The local file path.
 */
async function downloadFromCloudinary(url, localFileName) {
  const filePath = path.join(UPLOADS_DIR, localFileName);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);
  const fs = require('fs');
  const fileStream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
  return filePath;
}

const videoUploader = createVideoUploader();

module.exports = { 
  videoUploader, 
  deleteFile, 
  resolveUploadPath, 
  UPLOADS_DIR,
  uploadToCloudinary,
  deleteFromCloudinary,
  downloadFromCloudinary
};
