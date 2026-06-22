import { ISensorDataProvider } from "@/domain/types/interfaces";
import * as fs from "fs";
import * as path from "path";

export class FileDataProvider implements ISensorDataProvider {
  private values: number[] = [];
  private index: number = 0;
  private tipo: string;

  constructor(tipoSensor: string) {
    this.tipo = tipoSensor;
    
    const fileMap: Record<string, string> = {
      PRESION: "presion.txt",
      AMARRE: "amarre.txt",
      TENSION: "tension.txt",
      CAUDAL: "caudal.txt",
      ORIENTACION: "giroscopio.txt",
    };
    
    const filename = fileMap[tipoSensor];
    if (!filename) {
      throw new Error(`FileDataProvider no soporta el sensor ${tipoSensor}`);
    }
    
    const filePath = path.join(process.cwd(), "infrastructure", "data", filename);
    
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      this.values = content
        .split("\n")
        .map(line => parseFloat(line.trim()))
        .filter(val => !isNaN(val));
        
      if (this.values.length === 0) {
        throw new Error(`El archivo ${filename} está vacío o no tiene números válidos.`);
      }
    } catch (error) {
      console.error(`[FileDataProvider] Error cargando archivo ${filename}:`, error);
      this.values = [0]; // fallback array
    }
  }

  async obtenerDato(): Promise<number> {
    const value = this.values[this.index];
    this.index = (this.index + 1) % this.values.length; // Lectura cíclica
    return value;
  }
}
