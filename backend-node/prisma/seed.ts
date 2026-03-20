import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Users ---
  const passwordHash = await argon2.hash('password123', { type: argon2.argon2id });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@anahuac.mx' },
    update: {},
    create: {
      name: 'Carlos Admin',
      email: 'admin@anahuac.mx',
      passwordHash,
      role: UserRole.admin,
      isActive: true,
      isVerified: true,
      universityId: 'Anahuac Oaxaca',
      bio: 'Administrador de la plataforma de resenas.',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@anahuac.mx' },
    update: {},
    create: {
      name: 'Laura Gerente',
      email: 'manager@anahuac.mx',
      passwordHash,
      role: UserRole.manager,
      isActive: true,
      isVerified: true,
      universityId: 'Anahuac Oaxaca',
      bio: 'Gerente de la Cafeteria Principal.',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'estudiante@anahuac.mx' },
    update: {},
    create: {
      name: 'Maria Estudiante',
      email: 'estudiante@anahuac.mx',
      passwordHash,
      role: UserRole.student,
      isActive: true,
      isVerified: true,
      universityId: 'Anahuac Oaxaca',
      bio: 'Estudiante de Ingenieria en Software.',
    },
  });

  console.log(`Created users: ${admin.name}, ${manager.name}, ${student.name}`);

  // --- Establishments ---
  const establishmentsData = [
    {
      name: 'Cafeteria Principal',
      description: 'El comedor principal del campus. Ofrece desayunos y comidas completas con opciones variadas para toda la comunidad universitaria.',
      category: 'Desayunos y Comidas',
      managerId: manager.id,
      isActive: true,
      universityId: 'Anahuac Oaxaca',
      locationDetails: 'Edificio central, planta baja',
      openingHours: 'Lunes a Viernes: 7:00 AM - 4:00 PM',
    },
    {
      name: 'El Rincon',
      description: 'Punto de encuentro para snacks rapidos, bebidas frias y calientes, y antojitos entre clases.',
      category: 'Snacks y Bebidas',
      isActive: true,
      universityId: 'Anahuac Oaxaca',
      locationDetails: 'Junto a la biblioteca, primer piso',
      openingHours: 'Lunes a Viernes: 8:00 AM - 7:00 PM',
    },
    {
      name: 'Comedor Ejecutivo',
      description: 'Menu ejecutivo diario con entrada, plato fuerte, postre y bebida. Ideal para profesores y personal administrativo.',
      category: 'Menu Ejecutivo',
      isActive: true,
      universityId: 'Anahuac Oaxaca',
      locationDetails: 'Edificio de posgrados, segundo piso',
      openingHours: 'Lunes a Viernes: 12:00 PM - 4:00 PM',
    },
    {
      name: 'Food Truck Campus',
      description: 'Comida rapida estilo food truck: hamburguesas, hot dogs, papas y mas. El favorito para comer al aire libre.',
      category: 'Comida Rapida',
      isActive: true,
      universityId: 'Anahuac Oaxaca',
      locationDetails: 'Explanada principal, junto al estacionamiento',
      openingHours: 'Lunes a Viernes: 10:00 AM - 6:00 PM',
    },
  ];

  const establishments = [];
  for (const data of establishmentsData) {
    const est = await prisma.establishment.upsert({
      where: { id: '00000000-0000-0000-0000-000000000000' }, // force create
      update: {},
      create: data,
    });
    establishments.push(est);
  }

  // Re-fetch to get actual IDs (upsert with non-existing where always creates)
  const allEstablishments = await prisma.establishment.findMany({
    where: { universityId: 'Anahuac Oaxaca' },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Created ${allEstablishments.length} establishments`);

  // --- Reviews ---
  const reviewsData = [
    {
      userId: student.id,
      establishmentId: allEstablishments[0].id, // Cafeteria Principal
      foodScore: 4,
      serviceScore: 5,
      priceScore: 3,
      comment: 'La comida es buena y el servicio muy amable. Los precios podrian ser un poco mas accesibles para estudiantes.',
    },
    {
      userId: admin.id,
      establishmentId: allEstablishments[0].id, // Cafeteria Principal
      foodScore: 5,
      serviceScore: 4,
      priceScore: 4,
      comment: 'Excelente variedad en el menu del dia. Siempre tienen opciones frescas y bien preparadas.',
    },
    {
      userId: student.id,
      establishmentId: allEstablishments[1].id, // El Rincon
      foodScore: 3,
      serviceScore: 4,
      priceScore: 5,
      comment: 'Perfecto para un snack rapido entre clases. Los precios son muy accesibles y el cafe esta rico.',
    },
    {
      userId: admin.id,
      establishmentId: allEstablishments[1].id, // El Rincon
      foodScore: 4,
      serviceScore: 3,
      priceScore: 4,
      comment: 'Buenos snacks aunque a veces se acaban rapido en horas pico. El jugo natural es muy recomendable.',
    },
    {
      userId: student.id,
      establishmentId: allEstablishments[2].id, // Comedor Ejecutivo
      foodScore: 5,
      serviceScore: 5,
      priceScore: 2,
      comment: 'La calidad es increible pero el precio esta fuera de mi presupuesto de estudiante. Vale la pena para una ocasion especial.',
    },
    {
      userId: manager.id,
      establishmentId: allEstablishments[2].id, // Comedor Ejecutivo
      foodScore: 5,
      serviceScore: 5,
      priceScore: 4,
      comment: 'El mejor lugar para comer en el campus. El menu ejecutivo siempre tiene opciones gourmet de calidad.',
    },
    {
      userId: student.id,
      establishmentId: allEstablishments[3].id, // Food Truck Campus
      foodScore: 4,
      serviceScore: 3,
      priceScore: 5,
      comment: 'Las hamburguesas son deliciosas y muy baratas. A veces la fila es larga pero vale la pena esperar.',
    },
    {
      userId: manager.id,
      establishmentId: allEstablishments[3].id, // Food Truck Campus
      foodScore: 3,
      serviceScore: 3,
      priceScore: 5,
      comment: 'Buena opcion para comer rapido y economico. Las papas fritas son las mejores del campus.',
    },
  ];

  for (const data of reviewsData) {
    await prisma.review.create({ data });
  }

  console.log(`Created ${reviewsData.length} reviews`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
