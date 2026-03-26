import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await (prisma as any).supplier.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des fournisseurs' });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, contact, email, phone, address } = req.body;
    const supplier = await (prisma as any).supplier.create({
      data: { name, contact, email, phone, address }
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création du fournisseur' });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, contact, email, phone, address } = req.body;
    const supplier = await (prisma as any).supplier.update({
      where: { id: parseInt(id) },
      data: { name, contact, email, phone, address }
    });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la modification du fournisseur' });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await (prisma as any).supplier.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression' });
  }
};
