import { NextResponse } from "next/server";
import { operacionService } from "@/services";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Se espera que el body traiga { buqueNroIMO, plantaId }
    if (!body.buqueNroIMO || !body.plantaId) {
      return NextResponse.json({ error: "Faltan datos requeridos (buqueNroIMO, plantaId)" }, { status: 400 });
    }

    const newOpId = await operacionService.planificarOperacion(body.buqueNroIMO, body.plantaId);
    
    return NextResponse.json({ success: true, id: newOpId, estado: "PLANIFICADA" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
