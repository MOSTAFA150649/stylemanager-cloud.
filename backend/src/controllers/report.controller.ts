import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaySales = await (prisma as any).sale.findMany({
      where: { createdAt: { gte: today } },
      include: { items: { include: { product: true } } }
    });
    
    const monthSales = await (prisma as any).sale.findMany({
      where: { createdAt: { gte: firstDayOfMonth } },
      include: { items: { include: { product: true } } }
    });

    const expenses = await (prisma as any).expense.findMany({
      where: { createdAt: { gte: firstDayOfMonth } }
    });

    const products = await (prisma as any).product.findMany({
      include: { supplier: true }
    });
    
    const lowStockProducts = products.filter((p: any) => p.quantity <= p.alertThreshold);

    const calculateNetProfit = (sales: any[], exp: any[]) => {
      const revenue = sales.reduce((acc: number, sale: any) => acc + sale.totalAmount, 0);
      const cogs = sales.reduce((acc: number, sale: any) => {
        return acc + sale.items.reduce((itemAcc: number, item: any) => {
          return itemAcc + (item.quantity * (item.product?.buyPrice || 0));
        }, 0);
      }, 0);
      const totalExpenses = exp.reduce((acc: number, e: any) => acc + e.amount, 0);
      return revenue - cogs - totalExpenses;
    };

    const todayRevenue = todaySales.reduce((acc: number, s: any) => acc + s.totalAmount, 0);
    const monthRevenue = monthSales.reduce((acc: number, s: any) => acc + s.totalAmount, 0);
    const monthNetProfit = calculateNetProfit(monthSales, expenses);

    res.json({
      todaySales: todaySales.length,
      todayRevenue,
      monthSales: monthSales.length,
      monthRevenue,
      monthNetProfit,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5), // Top 5 alerts
      totalProducts: products.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération des statistiques' });
  }
};

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const sales = await (prisma as any).sale.findMany({
      include: {
        items: { include: { product: true } },
        customer: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du rapport de ventes' });
  }
};
