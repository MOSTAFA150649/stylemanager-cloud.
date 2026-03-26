import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Aucun fichier uploadé' });
      return;
    }
    // On retourne le chemin relatif vers l'image
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
});

export default router;
