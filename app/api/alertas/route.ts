import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const operacionId = req.nextUrl.searchParams.get('operacionId');
  const token = (await cookies()).get('auth_token')?.value;

  const qs = operacionId ? `?operacionId=${operacionId}` : '';
  const res = await fetch(`${API}/v1/alertas${qs}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: 'no-store',
  });

  const body = await res.json().catch(() => ({ data: [] }));
  // El back devuelve {data, pagination}; este componente espera array plano.
  return NextResponse.json(body.data ?? [], { status: res.status });
}