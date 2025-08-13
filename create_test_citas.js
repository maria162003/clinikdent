// Script para crear citas de prueba para hoy y mañana
const db = require('./Backend/config/db');

async function createTestCitas() {
    try {
        console.log('🧪 Creando citas de prueba para notificaciones...');

        const hoy = new Date();
        const manana = new Date();
        manana.setDate(hoy.getDate() + 1);

        const fechaHoy = hoy.toISOString().split('T')[0];
        const fechaManana = manana.toISOString().split('T')[0];

        // Verificar si hay odontólogos disponibles
        const [odontologos] = await db.query('SELECT id, nombre, apellido FROM usuarios WHERE rol = "odontologo"');
        console.log('👨‍⚕️ Odontólogos disponibles:', odontologos);

        if (odontologos.length === 0) {
            console.log('❌ No hay odontólogos disponibles');
            return;
        }

        const odontologoId = odontologos[0].id;

        // Verificar si hay pacientes disponibles
        const [pacientes] = await db.query('SELECT id, nombre, apellido FROM usuarios WHERE rol = "paciente" LIMIT 3');
        console.log('👥 Pacientes disponibles:', pacientes);

        if (pacientes.length === 0) {
            console.log('❌ No hay pacientes disponibles');
            return;
        }

        // Crear citas de prueba
        const citas = [
            // Citas de hoy
            {
                pacienteId: pacientes[0]?.id,
                odontologoId,
                fecha: fechaHoy,
                hora: '09:00:00',
                estado: 'confirmada',
                motivo: 'Limpieza dental'
            },
            {
                pacienteId: pacientes[1]?.id || pacientes[0].id,
                odontologoId,
                fecha: fechaHoy,
                hora: '14:00:00',
                estado: 'programada',
                motivo: 'Revisión general'
            },
            // Citas de mañana
            {
                pacienteId: pacientes[2]?.id || pacientes[0].id,
                odontologoId,
                fecha: fechaManana,
                hora: '10:30:00',
                estado: 'confirmada',
                motivo: 'Endodoncia'
            }
        ];

        for (const cita of citas) {
            if (!cita.pacienteId) continue;

            // Verificar si la cita ya existe
            const [existing] = await db.query(
                'SELECT id FROM citas WHERE odontologo_id = ? AND paciente_id = ? AND fecha = ? AND hora = ?',
                [cita.odontologoId, cita.pacienteId, cita.fecha, cita.hora]
            );

            if (existing.length === 0) {
                await db.query(
                    'INSERT INTO citas (paciente_id, odontologo_id, fecha, hora, estado, motivo, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        cita.pacienteId,
                        cita.odontologoId,
                        cita.fecha,
                        cita.hora,
                        cita.estado,
                        cita.motivo,
                        'Datos de prueba para notificaciones'
                    ]
                );
                console.log(`✅ Cita creada: ${cita.fecha} ${cita.hora} - ${cita.motivo}`);
            } else {
                console.log(`⚠️ Cita ya existe: ${cita.fecha} ${cita.hora}`);
            }
        }

        console.log('\n🎉 Citas de prueba creadas exitosamente!');
        console.log(`👨‍⚕️ Odontólogo ID: ${odontologoId} (${odontologos[0].nombre} ${odontologos[0].apellido})`);
        console.log(`📅 Citas para ${fechaHoy} y ${fechaManana}`);
        console.log('🔔 Las notificaciones deberían aparecer en el dashboard');

    } catch (error) {
        console.error('❌ Error al crear citas de prueba:', error);
    }
}

// Ejecutar el script
createTestCitas()
    .then(() => {
        console.log('\n✨ Script completado');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
