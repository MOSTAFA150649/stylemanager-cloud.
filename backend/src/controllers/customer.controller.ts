import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { lastName: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Les nom et prénom sont requis' });
    }
    const customer = await prisma.customer.create({
      data: { firstName, lastName, email, phone }
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création du client' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, loyaltyPoints } = req.body;
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: { firstName, lastName, email, phone, loyaltyPoints }
    });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la modification du client' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression' });
  }
};
