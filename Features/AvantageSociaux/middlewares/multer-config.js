const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Extensions autorisées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// 📌 Always save to SAME ABSOLUTE FOLDER used by server.js
const uploadDir = path.join(process.cwd(), "Features/AvantageSociaux/Public/images");

// Create directory if missing
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype] || 'jpg';
    cb(null, name + '_' + Date.now() + '.' + extension);
  },
});

// Middleware
const uploadImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'image_AS', maxCount: 1 },
  { name: 'images_AS', maxCount: 5 },
]);

// Wrapper for multer errors
const handleUploadErrors = (req, res, next) => {
  uploadImages(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
};

module.exports = { uploadImages: handleUploadErrors };
