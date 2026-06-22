import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/persistence/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const sensores = await prisma.sensor.findMany();
    return NextResponse.json(sensores);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}