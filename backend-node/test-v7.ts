import 'dotenv/config';
import prisma from './src/infrastructure/database/prisma.service';

/**
 * Script de validación de conexión para Prisma v7.
 * Esta versión inyecta la DATABASE_URL manualmente en el constructor
 * si no está definida en el schema.prisma.
 */

async function testV7Connection() {
    console.log('⏳ Probando conexión real con Supabase (Prisma v7)...');

    try {
        // 1. Handshake básico
        await prisma.$connect();
        console.log('🔗 Handshake exitoso.');

        // 2. Query de datos reales del PRD
        const userCount = await prisma.user.count();
        const establishmentCount = await prisma.establishment.count();

        console.log('✅ CONEXIÓN ESTABLECIDA AL 100%');
        console.log(`📊 Datos detectados: ${userCount} usuarios y ${establishmentCount} establecimientos.`);

        if (userCount > 0) {
            const firstUser = await prisma.user.findFirst({ select: { email: true, role: true } });
            console.log(`👤 Test de lectura: Primer usuario detectado como "${firstUser?.role}" (${firstUser?.email})`);
        }

    } catch (error) {
        console.error('❌ Error de conexión en Prisma v7:');
        if (error instanceof Error) {
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack?.split('\n')[0]);
        } else {
            console.error(error);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testV7Connection();
