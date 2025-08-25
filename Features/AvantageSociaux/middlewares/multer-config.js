const multer = require('multer');
const { join } = require('path');
const fs = require('fs');

// Extensions autorisées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Crée le dossier si inexistant
const uploadDir = join(__dirname, '../Public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
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

// Middleware Multer
// Accepte une image unique ou plusieurs images
const uploadImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
}).fields([
  { name: 'image_AS', maxCount: 1 },   // image unique
  { name: 'images_AS', maxCount: 5 },  // images multiples
]);

// Middleware pour gérer les erreurs Multer
const handleUploadErrors = (req, res, next) => {
  uploadImages(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Erreur spécifique Multer
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Autres erreurs
      return res.status(500).json({ error: err.message });
    }
    next();
  });
};

module.exports = {
  uploadImages: handleUploadErrors,
};
