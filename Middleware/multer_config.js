import multer, { diskStorage } from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Extensions autorisées
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Chemin absolu vers le dossier courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration de multer
const storage = diskStorage({
  destination: (req, file, callback) => {
    callback(null, join(__dirname, "../Public/images"));
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + "_" + Date.now() + "." + extension);
  },
});

// Export du middleware multer
export default multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 Mo
}).single("image"); // Le champ du formulaire s'appelle "image"
