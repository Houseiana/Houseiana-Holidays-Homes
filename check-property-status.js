
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const propertyId = 'cmikmsu350001jo04b5j4gqd0';
  console.log(`Checking status for property: ${propertyId}`);

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true, status: true }
    });

    if (!property) {
      console.log('Property not found');
    } else {
      console.log('Property found:', property);
    }
  } catch (error) {
    console.error('Error fetching property:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
