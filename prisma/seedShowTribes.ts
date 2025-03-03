import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  console.log('beginning: ', process.env.DATABASE_URL)


  await prisma.showTribe.createMany({
    data: [
      { name: 'Gata', season: 47, color: '#decb4e' },
      { name: 'Lavo', season: 47, color: '#d43737' },
      { name: 'Tuku', season: 47, color: '#77c471' },
      { name: 'Beka', season: 47, color: '#962feb' },
    ],
  });

  console.log('Seed data for Show Tribes added!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
