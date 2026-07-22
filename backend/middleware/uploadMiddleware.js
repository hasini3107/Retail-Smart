const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { bucket } = require('../config/firebase');

// Configure disk storage directory
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage for file uploads
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload file buffer helper
const uploadToFirebaseStorage = async (file) => {
  if (!file) return null;

  const timestamp = Date.now();
  const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
  const localFileName = `uploads/${timestamp}_${safeBaseName}`;
  const localPath = path.join(__dirname, '../../', localFileName);

  // Always save locally so the image is served reliably
  try {
    fs.writeFileSync(localPath, file.buffer);
  } catch (err) {
    console.error('Error saving uploaded image to local disk:', err.message);
  }

  // Attempt Firebase Storage cloud upload if bucket is available
  if (bucket) {
    try {
      const cloudPath = `products/${timestamp}_${safeBaseName}`;
      const fileRef = bucket.file(cloudPath);
      await fileRef.save(file.buffer, {
        metadata: { contentType: file.mimetype },
        public: true
      });
      return `https://storage.googleapis.com/${bucket.name}/${cloudPath}`;
    } catch (err) {
      // Cloud storage bucket optional fallback
    }
  }

  return localFileName;
};

module.exports = {
  upload,
  uploadToFirebaseStorage
};
