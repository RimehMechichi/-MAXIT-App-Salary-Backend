const multer = require('multer');
<<<<<<< HEAD
const path = require('path');
=======
const { join } = require('path');
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
const fs = require('fs');

// Extensions autorisées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

<<<<<<< HEAD
// 📌 Always save to SAME ABSOLUTE FOLDER used by server.js
const uploadDir = path.join(process.cwd(), "Features/AvantageSociaux/Public/images");

// Create directory if missing
=======
// Crée le dossier si inexistant
const uploadDir = join(__dirname, '../Public/images');
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

<<<<<<< HEAD
// Storage
=======
// Configuration du stockage
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
      return res.status(500).json({ error: err.message });
    }
    next();
  });
};

<<<<<<< HEAD
module.exports = { uploadImages: handleUploadErrors };
=======
module.exports = {
  uploadImages: handleUploadErrors,
};
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
