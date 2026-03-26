import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendWhatsAppNotification } from '../services/whatsappService';

const prisma = new PrismaClient();

export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, paymentMethod, customerId } = req.body;
    const userId = req.user?.id;

    if (!items || !items.length) {
      res.status(400).json({ error: 'Panier vide' });
      return;
    }
    if (!userId) {
      res.status(401).json({ error: 'Non autorisé' });
      return;
    }

    const sale = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const saleItemsData: any[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Produit introuvable (ID: ${item.productId})`);
        }

        let variant = null;
        if (item.variantId) {
          variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant) throw new Error(`Variante introuvable (ID: ${item.variantId})`);
          if (variant.quantity < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name} (${variant.size || ''} ${variant.color || ''})`);
          }
        } else {
          if (product.quantity < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name}`);
          }
        }

        const subtotal = product.sellPrice * item.quantity;
        totalAmount += subtotal;

        saleItemsData.push({
          productId: product.id,
          variantId: variant ? variant.id : null,
          quantity: item.quantity,
          unitPrice: product.sellPrice,
          subtotal
        });

        // Déduire le stock
        if (variant) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { quantity: variant.quantity - item.quantity }
          });
        } else {
          await tx.product.update({
            where: { id: product.id },
            data: { quantity: product.quantity - item.quantity }
          });
        }
      }

      // Calcul des points de fidélité (ex: 1 point pour 10€)
      const pointsEarned = Math.floor(totalAmount / 10);

      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: { loyaltyPoints: { increment: pointsEarned } }
        });
      }

      // Créer la vente
      return await tx.sale.create({
        data: {
          userId,
          totalAmount,
          taxAmount: 0, // Simplified TVA for MVP
          paymentMethod: paymentMethod || 'CASH',
          customerId: customerId || null,
          items: {
            create: saleItemsData
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    // Notifications WhatsApp après une vente réussie
    const msg = `🛒 *Nouvelle Vente !*\n💰 Total: ${sale.totalAmount} DH\n📦 Articles: ${sale.items.length}`;
    sendWhatsAppNotification(msg).catch(err => console.error('Erreur WhatsApp Service:', err));

    res.status(201).json(sale);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erreur lors de la création de la vente' });
  }
};

export const getTodaySales = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, reference: true } }
          }
        },
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes' });
  }
};
