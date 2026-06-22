import fs from 'fs';
import path from 'path';

export type UmbralesConfig = {
  AMARRE:      { amarilla: number; roja: number };
  TENSION:     { amarilla: number; roja: number };
  PRESION:     { amarillaAlta: number; rojaAlta: number; rojaBaja: number; rojaDiscrepancia: number };
  CAUDAL:      { amarilla: number };
  OLEAJE:      { amarilla: number; roja: number };
  ORIENTACION: { amarilla: number; roja: number };
  CORRIENTE:   { amarilla: number; roja: number };
  VIENTO:      { amarilla: number; roja: number };
};

const ARCHIVO = path.join(process.cwd(), '.umbrales.json');

const DEFAULTS: UmbralesConfig = {
  AMARRE:      { amarilla: 600.0,      roja: 900.0 },
  TENSION:     { amarilla: 8.0,        roja: 12.0 },
  PRESION:     { amarillaAlta: 1_400_000.0, rojaAlta: 1_600_000.0, rojaBaja: 50_000.0, rojaDiscrepancia: 200_000.0 },
  CAUDAL:      { amarilla: 1600.0 },
  OLEAJE:      { amarilla: 2.5,        roja: 3.5 },
  ORIENTACION: { amarilla: 15.0,       roja: 25.0 },
  CORRIENTE:   { amarilla: 1.5,        roja: 2.2 },
  VIENTO:      { amarilla: 55.0,       roja: 75.0 },
};

export function getUmbrales(): UmbralesConfig {
  try {
    const raw = fs.readFileSync(ARCHIVO, 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function setUmbrales(nuevo: Partial<UmbralesConfig>): UmbralesConfig {
  const actualizado = { ...getUmbrales(), ...nuevo };
  fs.writeFileSync(ARCHIVO, JSON.stringify(actualizado, null, 2));
  return actualizado;
}