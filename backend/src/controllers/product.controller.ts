import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await (prisma as any).product.findMany({
      include: {
        category: true,
        variants: true,
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, reference, buyPrice, sellPrice, quantity, alertThreshold, categoryId, imageUrl, variants, supplierId } = req.body;
    
    // Validation et conversion sécurisée des données
    const data = {
      name,
      reference: reference && reference.trim() !== "" ? reference.trim() : null, // Important: gère le @unique
      buyPrice: buyPrice ? Number(buyPrice) : 0,
      sellPrice: sellPrice ? Number(sellPrice) : 0,
      quantity: quantity ? Number(quantity) : 0,
      alertThreshold: alertThreshold ? Number(alertThreshold) : 5,
      categoryId: categoryId ? Number(categoryId) : null,
      supplierId: supplierId ? Number(supplierId) : null,
      imageUrl,
      variants: {
        create: variants && Array.isArray(variants) ? variants.map((v: any) => ({
          size: v.size,
          color: v.color,
          sku: v.sku,
          quantity: Number(v.quantity) || 0
        })) : []
      }
    };

    const product = await (prisma as any).product.create({
      data,
      include: { variants: true }
    });
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Erreur Prisma creation:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Une référence identique existe déjà.' });
      return;
    }
    res.status(500).json({ error: 'Erreur lors de la création du produit: ' + error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, reference, buyPrice, sellPrice, quantity, alertThreshold, categoryId, imageUrl, variants, supplierId } = req.body;
    
    if (variants && Array.isArray(variants)) {
      await (prisma as any).productVariant.deleteMany({ where: { productId: Number(id) } });
    }

    const product = await (prisma as any).product.update({
      where: { id: Number(id) },
      data: {
        name,
        reference: reference !== undefined ? (reference && reference.trim() !== "" ? reference.trim() : null) : undefined,
        buyPrice: buyPrice !== undefined ? Number(buyPrice || 0) : undefined,
        sellPrice: sellPrice !== undefined ? Number(sellPrice || 0) : undefined,
        quantity: quantity !== undefined ? Number(quantity || 0) : undefined,
        alertThreshold: alertThreshold !== undefined ? Number(alertThreshold || 5) : undefined,
        categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : undefined,
        supplierId: supplierId !== undefined ? (supplierId ? Number(supplierId) : null) : undefined,
        imageUrl,
        variants: variants && Array.isArray(variants) ? {
          create: variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            sku: v.sku,
            quantity: Number(v.quantity) || 0
          }))
        } : undefined
      },
      include: { variants: true }
    });
    res.json(product);
  } catch (error: any) {
    console.error('Erreur Prisma update:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit: ' + error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await (prisma as any).product.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
