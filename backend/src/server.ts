import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';

import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import uploadRoutes from './routes/upload.routes';
import saleRoutes from './routes/sale.routes';
import customerRoutes from './routes/customer.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import settingRoutes from './routes/setting.routes';
import expenseRoutes from './routes/expense.routes';
import supplierRoutes from './routes/supplier.routes';
import path from 'path';
import fs from 'fs';

dotenv.config();

const userDataPath = process.env.USER_DATA_PATH;

// Database configuration for Electron
if (userDataPath && (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql'))) {
  const dbPath = path.join(userDataPath, 'stylemanager.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log(`Using local database at: ${dbPath}`);
} else {
  console.log(`Using database: ${process.env.DATABASE_URL?.split('@')[1] || 'Cloud DB'}`);
}

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// Path for uploads
let uploadsPath = path.join(__dirname, '../public/uploads');
if (userDataPath) {
  uploadsPath = path.join(userDataPath, 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
}

app.use(cors());
app.use(express.json());

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Fichiers statiques (photos)
app.use('/uploads', express.static(uploadsPath));

// Routes
// ... (toutes les routes déjà présentes) ...

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// IMPORTANT pour Vercel : Exportez l'application
export default app;

// Ne lancez le serveur que si on n'est pas sur Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}


