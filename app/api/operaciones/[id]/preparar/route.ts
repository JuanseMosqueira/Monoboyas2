import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/persistence/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.monoboyaId || !body.operadorLanchaId) {
      return NextResponse.json({ error: 'Falta monoboyaId o operadorLanchaId' }, { status: 400 });
    }

    // Buscamos al operador de planta que está logueado para asignárselo a la operación
    const cookieStore = await cookies();
    const rawUser = cookieStore.get('user_data')?.value;
    const user = rawUser ? JSON.parse(rawUser) : null;
    const operadorPlantaId = user?.dni || null;

    // Actualizamos la operación en Prisma
    const operacionActualizada = await prisma.operacion.update({
      where: { id: Number(id) },
      data: {
        monoboyaId: Number(body.monoboyaId),
        operadorLanchaId: Number(body.operadorLanchaId),
        operadorPlantaId: operadorPlantaId,
        // En nuestro nuevo dominio no existe PREPARADA, la dejamos PLANIFICADA pero con recursos asignados
      }
    });

    // Marcamos la monoboya como OCUPADA
    await prisma.monoboya.update({
      where: { id: Number(body.monoboyaId) },
      data: { estado: 'OCUPADA' }
    });

    return NextResponse.json(operacionActualizada);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}