import { NextResponse } from "next/server";
import { prisma } from "@/persistence/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dni = Number(searchParams.get('dni'));

    if (!dni) {
      return NextResponse.json({ error: "Falta el DNI" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { dni }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const userId = usuario.id;

    // Buscamos cualquier operación asignada a este usuario usando su ID real
    const operaciones = await prisma.operacion.findMany({
      where: {
        OR: [
          { operadorPlantaId: userId },
          { operadorBuqueId: userId },
          { operadorLanchaId: userId }
        ],
        estado: {
          in: ['PLANIFICADA', 'ENCURSO', 'DETENIDA']
        }
      },
      orderBy: { id: 'desc' },
      take: 1
    });

    return NextResponse.json(operaciones);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
