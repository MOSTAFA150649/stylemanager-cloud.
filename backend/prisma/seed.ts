import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@stylemanager.com' },
    update: {},
    create: {
      email: 'admin@stylemanager.com',
      passwordHash,
      role: 'PROPRIETAIRE',
    },
  });
  console.log('Utilisateur initial créé avec succès :', { email: user.email, role: user.role });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
