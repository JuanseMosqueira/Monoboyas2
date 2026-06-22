import { ISensorDataProvider } from "@/domain/types/interfaces";

export class ApiDataProvider implements ISensorDataProvider {
  private url: string;
  private tipo: string;

  constructor(tipoSensor: string) {
    this.tipo = tipoSensor;
    if (tipoSensor === "VIENTO") {
      this.url = "https://api.open-meteo.com/v1/forecast?latitude=-38.71&longitude=-62.28&current_weather=true&timezone=auto";
    } else if (tipoSensor === "OLEAJE") {
      this.url = "https://marine-api.open-meteo.com/v1/marine?latitude=-38.71&longitude=-62.28&hourly=wave_height&timezone=auto";
    } else if (tipoSensor === "CORRIENTE") {
      this.url = "https://marine-api.open-meteo.com/v1/marine?latitude=-38.71&longitude=-62.28&hourly=ocean_current_velocity&timezone=auto";
    } else {
      throw new Error(`ApiDataProvider no soporta el sensor ${tipoSensor}`);
    }
  }

  async obtenerDato(): Promise<number> {
    try {
      const response = await fetch(this.url);
      const data = await response.json();

      if (this.tipo === "VIENTO") {
        return data.current_weather?.windspeed ?? 0.0;
      } else if (this.tipo === "OLEAJE") {
        const waveHeights = data.hourly?.wave_height;
        if (Array.isArray(waveHeights) && waveHeights.length > 0) {
          return waveHeights[0] ?? 0.0;
        }
      } else if (this.tipo === "CORRIENTE") {
        const currentVelocities = data.hourly?.ocean_current_velocity;
        if (Array.isArray(currentVelocities) && currentVelocities.length > 0) {
          return currentVelocities[0] ?? 0.0;
        }
      }
    } catch (error) {
      console.error(`[ApiDataProvider] Error obteniendo datos para ${this.tipo}:`, error);
    }
    return 0.0; // Fallback
  }
}
