import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("auth_token")?.value;
  const body = await req.json();

  const API_URL = process.env.API_URL ?? "http://localhost:8080";

  const res = await fetch(`${API_URL}/v1/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}