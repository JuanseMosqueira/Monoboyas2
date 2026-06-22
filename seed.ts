import { PrismaClient, TipoSensor, OrigenMedicion, TipoAlerta, EstadoOperacion } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando base de datos (esto puede tardar unos segundos)...');

  // El orden es importante por las Foreign Keys
  await prisma.usuarioAlerta.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.medicion.deleteMany();
  await prisma.operacion.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.monoboya.deleteMany();
  await prisma.buque.deleteMany();
  await prisma.planta.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🌱 Sembrando datos ficticios masivos...');

  // 1. Usuarios (Operadores y Admin)
  const admin = await prisma.usuario.create({
    data: { nombre: 'Laura (Admin)', email: 'admin@spm.com', rol: 'ADMIN' }
  });
  const opPlanta1 = await prisma.usuario.create({
    data: { nombre: 'María (Planta Norte)', email: 'planta1@spm.com', rol: 'OPERADOR_PLANTA' }
  });
  const opPlanta2 = await prisma.usuario.create({
    data: { nombre: 'Jorge (Planta Sur)', email: 'planta2@spm.com', rol: 'OPERADOR_PLANTA' }
  });
  const opBuque1 = await prisma.usuario.create({
    data: { nombre: 'Capitán Roberts', email: 'buque1@spm.com', rol: 'OPERADOR_BUQUE' }
  });
  const opBuque2 = await prisma.usuario.create({
    data: { nombre: 'Capitán Lee', email: 'buque2@spm.com', rol: 'OPERADOR_BUQUE' }
  });
  const opLancha1 = await prisma.usuario.create({
    data: { nombre: 'Carlos (Lancha)', email: 'lancha1@spm.com', rol: 'OPERADOR_LANCHA' }
  });

  // 2. Plantas
  const plantaNorte = await prisma.planta.create({
    data: { nombre: 'Planta Terminal Norte', ubicacion: 'Bahía Blanca' }
  });
  const plantaSur = await prisma.planta.create({
    data: { nombre: 'Refinería Sur', ubicacion: 'Comodoro Rivadavia' }
  });

  // 3. Monoboyas
  const monoboyas = [];
  for (let i = 1; i <= 5; i++) {
    const estado = i === 5 ? 'DESHABILITADA' : (i === 1 ? 'OCUPADA' : 'DISPONIBLE');
    monoboyas.push(await prisma.monoboya.create({
      data: { nombre: `Monoboya ${String.fromCharCode(64 + i)}`, estado: estado as any }
    }));
  }

  // 4. Buques
  const buques = [];
  const nombresBuques = ['Oceanic Explorer', 'Atlantic Voyager', 'Pacific Titan', 'Gulf Navigator', 'Nordic Spirit'];
  for (let i = 0; i < 5; i++) {
    buques.push(await prisma.buque.create({
      data: {
        nroIMO: 9000000 + Math.floor(Math.random() * 900000),
        nombre: nombresBuques[i],
        capacidadMax: 100000 + (i * 20000),
        capacidadActual: Math.floor(Math.random() * 80000)
      }
    }));
  }

  // 5. Sensores
  console.log('📡 Configurando Sensores...');
  const sensores = [];
  const tiposSensores: TipoSensor[] = ['TENSION', 'PRESION', 'OLEAJE', 'ORIENTACION', 'CORRIENTE', 'VIENTO', 'CAUDAL', 'AMARRE'];

  // Sensores para monoboyas
  for (const m of monoboyas) {
    for (const tipo of tiposSensores) {
      let unidad = '';
      if (tipo === 'TENSION' || tipo === 'AMARRE') unidad = 't';
      else if (tipo === 'PRESION') unidad = 'bar';
      else if (tipo === 'VIENTO') unidad = 'km/h';
      else if (tipo === 'CAUDAL') unidad = 'm3/h';
      else if (tipo === 'CORRIENTE') unidad = 'kn';
      else if (tipo === 'OLEAJE') unidad = 'm';
      else if (tipo === 'ORIENTACION') unidad = '°';

      sensores.push(await prisma.sensor.create({
        data: {
          tipo,
          unidad,
          monoboyaId: m.id
        }
      }));
    }
  }

  // 6. Operaciones
  console.log('⚙️ Creando historial de operaciones...');
  const operaciones = [];

  // Operación 1: EN CURSO (Muy activa, alertas recientes)
  operaciones.push(await prisma.operacion.create({
    data: {
      estado: 'ENCURSO',
      tipo: 'DESCARGA',
      buqueNroIMO: buques[0].nroIMO,
      plantaId: plantaNorte.id,
      monoboyaId: monoboyas[0].id,
      operadorBuqueId: opBuque1.id,
      operadorPlantaId: opPlanta1.id,
      operadorLanchaId: opLancha1.id,
    }
  }));

  // Operación 2: PLANIFICADA
  operaciones.push(await prisma.operacion.create({
    data: {
      estado: 'PLANIFICADA',
      tipo: 'CARGA',
      buqueNroIMO: buques[1].nroIMO,
      plantaId: plantaSur.id,
      monoboyaId: monoboyas[1].id,
      operadorBuqueId: opBuque2.id,
      operadorPlantaId: opPlanta2.id,
    }
  }));

  // Operación 3: FINALIZADA (Historial pasado)
  operaciones.push(await prisma.operacion.create({
    data: {
      estado: 'FINALIZADA',
      tipo: 'DESCARGA',
      buqueNroIMO: buques[2].nroIMO,
      plantaId: plantaNorte.id,
      monoboyaId: monoboyas[2].id,
    }
  }));

  // Operación 4: DETENIDA (Por mal clima)
  operaciones.push(await prisma.operacion.create({
    data: {
      estado: 'DETENIDA',
      tipo: 'CARGA',
      buqueNroIMO: buques[3].nroIMO,
      plantaId: plantaSur.id,
      monoboyaId: monoboyas[3].id,
    }
  }));

  // 7. Mediciones y Alertas para la Operación EN CURSO
  console.log('📈 Simulando miles de mediciones...');
  const opActiva = operaciones[0];
  const sensoresActivos = sensores.filter(s => s.monoboyaId === opActiva.monoboyaId);

  // Vamos a generar unas 100 mediciones hacia atrás en el tiempo
  let medicionPeligrosa = null;

  for (let i = 100; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 60000); // Una por minuto

    for (const sensor of sensoresActivos) {
      let valorBase = 50;
      if (sensor.tipo === 'VIENTO') valorBase = 20 + Math.random() * 10;
      if (sensor.tipo === 'TENSION') valorBase = 100 + Math.random() * 50;

      // Generar un pico de tensión peligroso hace 5 minutos
      if (i === 5 && sensor.tipo === 'TENSION') {
        valorBase = 250; // Supera umbral crítico
      }

      const med = await prisma.medicion.create({
        data: {
          sensorId: sensor.id,
          valor: parseFloat(valorBase.toFixed(2)),
          unidad: sensor.unidad,
          tipo: sensor.tipo,
          origen: 'MONOBOYA',
          operacionId: opActiva.id,
          timestamp,
        }
      });

      if (i === 5 && sensor.tipo === 'TENSION') {
        medicionPeligrosa = med;
      }
    }
  }

  // 8. Crear alertas asociadas
  if (medicionPeligrosa) {
    console.log('🚨 Generando Alertas Críticas...');
    const alerta = await prisma.alerta.create({
      data: {
        tipoAlerta: 'ROJA',
        mensaje: 'Tensión crítica detectada en el cabo de amarre.',
        doubleMedicion: medicionPeligrosa.valor,
        stringMedicion: `${medicionPeligrosa.valor} kN`,
        operacionId: opActiva.id,
        medicionId: medicionPeligrosa.id,
        timestamp: medicionPeligrosa.timestamp
      }
    });

    // Asignar la alerta a los operadores
    await prisma.usuarioAlerta.createMany({
      data: [
        { alertaId: alerta.id, usuarioId: opPlanta1.id, reconocida: false },
        { alertaId: alerta.id, usuarioId: opBuque1.id, reconocida: true, reconocidaEn: new Date() }
      ]
    });
  }

  console.log('✅ ¡Base de datos poblada masivamente! Ya puedes revisar tu Dashboard.');
}

main()
  .catch((e) => {
    console.error('Error poblando DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
