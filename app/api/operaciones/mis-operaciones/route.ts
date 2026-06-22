import { NextResponse } from "next/server";
import { prisma } from "@/persistence/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dni = Number(searchParams.get('dni'));

    if (!dni) {
      return NextResponse.json({ error: "Falta el DNI" }, { status: 400 });
    }

    // Buscamos cualquier operación asignada a este usuario (que ahora sabemos que el DNI es su ID)
    const operaciones = await prisma.operacion.findMany({
      where: {
        OR: [
          { operadorPlantaId: dni },
          { operadorBuqueId: dni },
          { operadorLanchaId: dni }
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
