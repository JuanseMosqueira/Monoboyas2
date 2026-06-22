import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const token = (await cookies()).get('auth_token')?.value ?? '';
  const r = await fetch(`${API_URL}/v1/sensores${req.nextUrl.search}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return NextResponse.json(await r.json(), { status: r.status });
}