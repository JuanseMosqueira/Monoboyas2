import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API = process.env.API_URL ?? 'http://localhost:8080';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('auth_token')?.value;

  const res = await fetch(`${API}/v1/operaciones/${id}/mediciones`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}