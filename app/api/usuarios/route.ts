import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/persistence/lib/prisma";
import type { RolUsuario } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.nombre || !body.email || !body.rol) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre: body.nombre,
        email: body.email,
        rol: body.rol as RolUsuario,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}