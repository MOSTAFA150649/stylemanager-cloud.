import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await (prisma as any).expense.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des dépenses' });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, amount, category } = req.body;
    const expense = await (prisma as any).expense.create({
      data: { description, amount: parseFloat(amount), category }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création de la dépense' });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await (prisma as any).expense.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression' });
  }
};
