import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function POST(request: NextRequest) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${API}/v1/operaciones`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}