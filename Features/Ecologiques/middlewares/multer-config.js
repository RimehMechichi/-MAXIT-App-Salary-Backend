const multer = require('multer');
const { join } = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../Public/images')); 
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype] || 'jpg';
    cb(null, name + '_' + Date.now() + '.' + extension);
  },
});

// Middleware multer pour un seul fichier avec champ 'image'
const uploadSingleImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
}).single('image_eventEco');

module.exports = {
  uploadSingleImage,
};
