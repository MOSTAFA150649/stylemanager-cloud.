import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { storeName: 'Ma Boutique' }
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeName, address, phone, currency, taxRate, ticketHeader, ticketFooter } = req.body;
    
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { storeName, address, phone, currency, taxRate, ticketHeader, ticketFooter }
      });
    } else {
      settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: { storeName, address, phone, currency, taxRate, ticketHeader, ticketFooter }
      });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
};
