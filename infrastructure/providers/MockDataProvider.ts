import { ISensorDataProvider } from "@/domain/types/interfaces";

export class MockDataProvider implements ISensorDataProvider {
  private base: number;
  private oscilacion: number;

  constructor(tipoSensor: string) {
    switch (tipoSensor) {
      case "PRESION": this.base = 9.5; this.oscilacion = 0.5; break;
      case "VIENTO": this.base = 18; this.oscilacion = 5; break;
      case "OLEAJE": this.base = 1.4; this.oscilacion = 0.3; break;
      case "CORRIENTE": this.base = 1.5; this.oscilacion = 0.4; break;
      case "CAUDAL": this.base = 1080; this.oscilacion = 50; break;
      case "AMARRE": this.base = 46; this.oscilacion = 8; break;
      case "TENSION": this.base = 46; this.oscilacion = 8; break;
      case "ORIENTACION": this.base = 0; this.oscilacion = 2; break;
      default: this.base = 10; this.oscilacion = 2; break;
    }
  }

  async obtenerDato(): Promise<number> {
    return this.base + (Math.random() * this.oscilacion * 2 - this.oscilacion);
  }
}
