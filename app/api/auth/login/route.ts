import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/persistence/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dni = Number(body.dni);

  // MOCK LOGIN INTELIGENTE:
  // DNI 1 = ADMIN
  // DNI 2 = OPERADOR_PLANTA
  // DNI 3 = OPERADOR_BUQUE
  let rolBuscado: any = 'ADMIN';
  if (dni === 2) rolBuscado = 'OPERADOR_PLANTA';
  if (dni === 3) rolBuscado = 'OPERADOR_BUQUE';

  const usuarioDb = await prisma.usuario.findFirst({
    where: { rol: rolBuscado }
  });

  if (!usuarioDb) {
    return NextResponse.json({ error: { message: 'Usuario no encontrado en la DB.' } }, { status: 404 });
  }

  const data = {
    token: 'jwt-falso-para-testear-nextjs',
    usuario: {
      dni: usuarioDb.id, // Pasamos su ID real de la base de datos como si fuera su DNI
      nombre: usuarioDb.nombre,
      rol: usuarioDb.rol,
      plantaId: null,
      buqueNroIMO: null,
      operacionId: null,
      creadoEn: new Date().toISOString()
    }
  };

  // Setear las cookies que el resto del front espera
  const cookieStore = await cookies();
  cookieStore.set('auth_token', data.token, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  });
  cookieStore.set('user_data', JSON.stringify(data.usuario), {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json(data);
}