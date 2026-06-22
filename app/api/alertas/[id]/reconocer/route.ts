import { NextResponse } from "next/server";
import { prisma } from "@/persistence/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alertaId = parseInt(id, 10);

  if (isNaN(alertaId)) {
    return NextResponse.json({ error: "ID de alerta inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const usuarioId = body.usuarioId; // Obligamos a mandar qué usuario reconoce

    if (!usuarioId) {
       return NextResponse.json({ error: "Falta usuarioId en el body. El reconocimiento es por usuario." }, { status: 400 });
    }

    // Buscamos si la alerta le pertenece
    const ua = await prisma.usuarioAlerta.findUnique({
      where: {
        alertaId_usuarioId: {
          alertaId,
          usuarioId
        }
      }
    });

    if (!ua) {
      return NextResponse.json({ error: "El usuario no recibió esta alerta o no existe" }, { status: 404 });
    }

    if (ua.reconocida) {
      // Contrato viejo: si ya está reconocida, error 409
      return NextResponse.json({ error: "La alerta ya fue reconocida por este usuario" }, { status: 409 });
    }

    // Actualizamos
    await prisma.usuarioAlerta.update({
      where: {
        alertaId_usuarioId: {
          alertaId,
          usuarioId
        }
      },
      data: {
        reconocida: true,
        reconocidaEn: new Date()
      }
    });

    return NextResponse.json({ success: true, message: "Alerta reconocida" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
