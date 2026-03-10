import argon2 from 'argon2';
import prisma from './src/infrastructure/database/prisma.service';

async function fixPasswords() {
    console.log('🛠️ Arreglando credenciales de prueba...');

    const hash = await argon2.hash('password123');
    console.log('🔑 Nuevo Hash generado.');

    await prisma.user.updateMany({
        where: { email: { in: ['admin@example.com', 'juan.gerente@rest.com', 'maria.estu@u.edu'] } },
        data: { passwordHash: hash }
    });

    console.log('✅ Usuarios de prueba actualizados con password: password123');
    await prisma.$disconnect();
}

fixPasswords();
