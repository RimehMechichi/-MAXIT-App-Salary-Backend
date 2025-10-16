const multer = require('multer');
const { join } = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../Public/images')); // matches static folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.params.userId}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const uploadSingleImage = multer({ storage }).single('picture');

module.exports = { uploadSingleImage };
