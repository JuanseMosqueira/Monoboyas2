import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // MOCK LOGIN: El backend de Java ya no existe y nuestra nueva DB usa Email en vez de DNI.
  // Para que puedas testear el frontend, aceptamos cualquier DNI/Password y mockeamos la respuesta.
  
  const data = {
    token: 'jwt-falso-para-testear-nextjs',
    usuario: {
      dni: Number(body.dni) || 12345678,
      nombre: 'Usuario de Prueba',
      rol: 'ADMIN',
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