import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Création du dossier d'upload s'il n'existe pas
let uploadDir = path.join(__dirname, '../../public/uploads');

// Sur Vercel, on utilise /tmp car le reste du système de fichiers est en lecture seule
if (process.env.VERCEL) {
  uploadDir = path.join('/tmp', 'uploads');
}

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.error("Impossible de créer le dossier d'upload (Lecture seule) :", error);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite: 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|heic|heif/;
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'image/heic' || file.mimetype === 'image/heif';
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Erreur: Seules les images sont autorisées (jpeg, jpg, png, webp, heic, heif)'));
  }
});
