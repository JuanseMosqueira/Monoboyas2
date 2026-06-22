import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/persistence/lib/prisma";

export async function GET() {
  try {
    const jar = await cookies();
    const userDataRaw = jar.get("user_data")?.value;
    
    let dni: number | undefined;
    if (userDataRaw) {
      try { dni = JSON.parse(userDataRaw).dni; } catch {}
    }
    
    if (!dni) return NextResponse.json([], { status: 401 });

    const alertasUsuario = await prisma.usuarioAlerta.findMany({
      where: { usuarioId: dni },
      include: { alerta: true },
      orderBy: { alerta: { timestamp: 'desc' } }
    });

    const response = alertasUsuario.map(ua => ({
      ...ua.alerta,
      reconocida: ua.reconocida,
      reconocidaEn: ua.reconocidaEn
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}