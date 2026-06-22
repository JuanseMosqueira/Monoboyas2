import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando carga de datos de prueba...');

    const planta = await prisma.planta.create({
        data: { nombre: 'Planta Central SPM', ubicacion: 'Costa' },
    });

    const buque = await prisma.buque.create({
        data: { nroIMO: 1234567, nombre: 'Buque Petrolero X', capacidadMax: 50000, capacidadActual: 10000 },
    });

    await prisma.monoboya.create({ data: { nombre: 'Monoboya Alpha', estado: 'DISPONIBLE' } });

    await prisma.operacion.create({
        data: { estado: 'PLANIFICADA', tipo: 'CARGA', buqueNroIMO: buque.nroIMO, plantaId: planta.id },
    });

    console.log('¡Datos de prueba insertados con éxito!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
