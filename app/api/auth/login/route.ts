import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

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