require('dotenv').config();
// No necesitamos importar fetch en Node.js moderno

const BASE_URL = 'http://localhost:3000/api';
const PACIENTE_ID = 8; // Juan Pérez (paciente@test.com)

async function probarFuncionalidadCitas() {
  console.log('🧪 Iniciando pruebas de funcionalidad de citas...\n');

  try {
    // 1. Crear una cita de prueba
    console.log('📝 1. Creando cita de prueba...');
    const nuevaCita = {
      id_paciente: PACIENTE_ID,
      fecha: '2025-08-15',
      hora: '14:00',
      motivo: 'blanqueamiento',
      notas: 'Primera cita de prueba'
    };

    const crearResponse = await fetch(`${BASE_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaCita)
    });

    const crearResult = await crearResponse.json();
    console.log('✅ Resultado:', crearResult);

    // 2. Obtener citas del paciente
    console.log('\n📅 2. Obteniendo citas del paciente...');
    const citasResponse = await fetch(`${BASE_URL}/citas/${PACIENTE_ID}`);
    const citas = await citasResponse.json();
    console.log(`✅ Citas encontradas: ${citas.length}`);
    
    if (citas.length > 0) {
      const ultimaCita = citas[0];
      console.log(`📋 Última cita: ID ${ultimaCita.id} - ${ultimaCita.fecha} ${ultimaCita.hora} - ${ultimaCita.motivo}`);

      // 3. Probar reprogramación
      console.log('\n🔄 3. Probando reprogramación...');
      const reprogramarData = {
        fecha: '2025-08-16',
        hora: '15:00',
        motivo: 'limpieza',
        notas: 'Cita reprogramada'
      };

      const reprogramarResponse = await fetch(`${BASE_URL}/citas/${ultimaCita.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reprogramarData)
      });

      const reprogramarResult = await reprogramarResponse.json();
      console.log('✅ Resultado reprogramación:', reprogramarResult);

      // 4. Verificar cita reprogramada
      console.log('\n🔍 4. Verificando cita reprogramada...');
      const citasActualizadas = await fetch(`${BASE_URL}/citas/${PACIENTE_ID}`);
      const citasNuevas = await citasActualizadas.json();
      const citaReprogramada = citasNuevas.find(c => c.id === ultimaCita.id);
      
      if (citaReprogramada) {
        console.log(`✅ Cita reprogramada: ${citaReprogramada.fecha} ${citaReprogramada.hora} - ${citaReprogramada.motivo}`);
      }

      // 5. Probar cancelación
      console.log('\n❌ 5. Probando cancelación...');
      const cancelarResponse = await fetch(`${BASE_URL}/citas/${ultimaCita.id}`, {
        method: 'DELETE'
      });

      const cancelarResult = await cancelarResponse.json();
      console.log('✅ Resultado cancelación:', cancelarResult);

      // 6. Crear otra cita para probar eliminación
      console.log('\n📝 6. Creando otra cita para probar eliminación...');
      const otraCita = {
        id_paciente: PACIENTE_ID,
        fecha: '2025-08-20',
        hora: '10:00',
        motivo: 'revision',
        notas: 'Cita para eliminar'
      };

      const crearOtraResponse = await fetch(`${BASE_URL}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(otraCita)
      });

      const otraResult = await crearOtraResponse.json();
      console.log('✅ Resultado:', otraResult);

      // Obtener la nueva cita creada
      const citasFinales = await fetch(`${BASE_URL}/citas/${PACIENTE_ID}`);
      const citasFinalesData = await citasFinales.json();
      const nuevaCitaCreada = citasFinalesData.find(c => c.motivo === 'revision');

      if (nuevaCitaCreada) {
        // 7. Probar eliminación completa
        console.log('\n🗑️ 7. Probando eliminación completa...');
        const eliminarResponse = await fetch(`${BASE_URL}/citas/${nuevaCitaCreada.id}/eliminar`, {
          method: 'DELETE'
        });

        const eliminarResult = await eliminarResponse.json();
        console.log('✅ Resultado eliminación:', eliminarResult);
      }
    }

    // 8. Estado final
    console.log('\n📊 8. Estado final de citas...');
    const citasFinales = await fetch(`${BASE_URL}/citas/${PACIENTE_ID}`);
    const citasFinalesData = await citasFinales.json();
    
    console.log(`✅ Total de citas finales: ${citasFinalesData.length}`);
    citasFinalesData.forEach(cita => {
      console.log(`  - ID ${cita.id}: ${cita.fecha} ${cita.hora} - ${cita.motivo} - Estado: ${cita.estado}`);
    });

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }

  console.log('\n🏁 Pruebas completadas');
}

// Solo ejecutar si el servidor está corriendo
probarFuncionalidadCitas();
