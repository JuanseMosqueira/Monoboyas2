import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jar = await cookies();
  const token = jar.get("auth_token")?.value;
  const userDataRaw = jar.get("user_data")?.value;
  const API_URL = process.env.API_URL ?? "http://localhost:8080";

  let dni: number | undefined;
  try { if (userDataRaw) dni = JSON.parse(userDataRaw).dni; } catch {}
  if (!dni) return NextResponse.json([], { status: 401 });

  const res = await fetch(`${API_URL}/v1/alertas/mis-alertas?dni=${dni}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}