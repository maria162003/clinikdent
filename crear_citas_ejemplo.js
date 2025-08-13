const mysql = require('mysql2/promise');
require('dotenv').config();

// Usar la misma configuración que el proyecto
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clinikdent',
    port: process.env.DB_PORT || 3306
};

async function crearCitasEjemplo() {
    try {
        console.log('🔗 Conectando a la base de datos...');
        const connection = await mysql.createConnection(dbConfig);
        
        // Verificar usuarios disponibles
        console.log('👥 Verificando usuarios disponibles...');
        const [usuarios] = await connection.execute('SELECT * FROM usuarios ORDER BY rol');
        console.log('Usuarios encontrados:', usuarios.length);
        
        // Encontrar pacientes y odontólogos
        const pacientes = usuarios.filter(u => u.rol === 'paciente');
        const odontologos = usuarios.filter(u => u.rol === 'odontologo');
        
        console.log(`📊 Pacientes: ${pacientes.length}, Odontólogos: ${odontologos.length}`);
        
        if (pacientes.length === 0 || odontologos.length === 0) {
            console.log('❌ No hay suficientes usuarios para crear citas de ejemplo');
            
            // Crear algunos usuarios de ejemplo si no existen
            if (pacientes.length === 0) {
                console.log('📝 Creando pacientes de ejemplo...');
                await connection.execute(`
                    INSERT INTO usuarios (rol, nombre, apellido, correo, contraseña_hash, telefono, estado) VALUES
                    ('paciente', 'Juan', 'Pérez', 'juan.perez@email.com', 'hash123', '3001234567', 'activo'),
                    ('paciente', 'María', 'González', 'maria.gonzalez@email.com', 'hash123', '3007654321', 'activo'),
                    ('paciente', 'Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', 'hash123', '3009876543', 'activo')
                `);
                console.log('✅ Pacientes creados');
            }
            
            if (odontologos.length === 0) {
                console.log('📝 Creando odontólogos de ejemplo...');
                await connection.execute(`
                    INSERT INTO usuarios (rol, nombre, apellido, correo, contraseña_hash, telefono, estado) VALUES
                    ('odontologo', 'Dr. Ana', 'Martínez', 'ana.martinez@clinikdent.com', 'hash123', '3001111111', 'activo'),
                    ('odontologo', 'Dr. Pedro', 'López', 'pedro.lopez@clinikdent.com', 'hash123', '3002222222', 'activo')
                `);
                console.log('✅ Odontólogos creados');
            }
            
            // Re-consultar usuarios
            const [usuariosActualizados] = await connection.execute('SELECT * FROM usuarios ORDER BY rol');
            const pacientesNuevos = usuariosActualizados.filter(u => u.rol === 'paciente');
            const odontologosNuevos = usuariosActualizados.filter(u => u.rol === 'odontologo');
            
            console.log(`📊 Usuarios actualizados - Pacientes: ${pacientesNuevos.length}, Odontólogos: ${odontologosNuevos.length}`);
        }
        
        // Obtener usuarios finales
        const [usuariosFinales] = await connection.execute('SELECT * FROM usuarios ORDER BY rol');
        const pacientesFinales = usuariosFinales.filter(u => u.rol === 'paciente');
        const odontologosFinales = usuariosFinales.filter(u => u.rol === 'odontologo');
        
        // Verificar si la tabla citas existe y crearla si no existe
        console.log('🏥 Verificando tabla de citas...');
        try {
            await connection.execute('SELECT 1 FROM citas LIMIT 1');
            console.log('✅ Tabla citas existe');
        } catch (error) {
            console.log('📝 Creando tabla citas...');
            await connection.execute(`
                CREATE TABLE citas (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    paciente_id INT NOT NULL,
                    odontologo_id INT NOT NULL,
                    fecha DATE NOT NULL,
                    hora TIME NOT NULL,
                    estado ENUM('programada', 'confirmada', 'completada', 'cancelada') DEFAULT 'programada',
                    motivo TEXT,
                    notas TEXT,
                    FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
                    FOREIGN KEY (odontologo_id) REFERENCES usuarios(id)
                )
            `);
            console.log('✅ Tabla citas creada');
        }
        
        // Limpiar citas existentes para empezar fresco
        await connection.execute('DELETE FROM citas');
        console.log('🧹 Citas anteriores eliminadas');
        
        // Crear citas de ejemplo
        console.log('📅 Creando citas de ejemplo...');
        
        const citasEjemplo = [
            {
                paciente_id: pacientesFinales[0].id,
                odontologo_id: odontologosFinales[0].id,
                fecha: '2025-08-15',
                hora: '09:00:00',
                estado: 'programada',
                motivo: 'Limpieza dental y revisión general',
                notas: 'Paciente con sensibilidad dental'
            },
            {
                paciente_id: pacientesFinales[1] ? pacientesFinales[1].id : pacientesFinales[0].id,
                odontologo_id: odontologosFinales[1] ? odontologosFinales[1].id : odontologosFinales[0].id,
                fecha: '2025-08-15',
                hora: '10:30:00',
                estado: 'confirmada',
                motivo: 'Extracción de muela del juicio',
                notas: 'Traer radiografías'
            },
            {
                paciente_id: pacientesFinales[2] ? pacientesFinales[2].id : pacientesFinales[0].id,
                odontologo_id: odontologosFinales[0].id,
                fecha: '2025-08-16',
                hora: '14:00:00',
                estado: 'programada',
                motivo: 'Empaste dental',
                notas: 'Caries en molar superior derecho'
            },
            {
                paciente_id: pacientesFinales[0].id,
                odontologo_id: odontologosFinales[1] ? odontologosFinales[1].id : odontologosFinales[0].id,
                fecha: '2025-08-12',
                hora: '11:00:00',
                estado: 'completada',
                motivo: 'Control post-operatorio',
                notas: 'Revisión después de cirugía'
            },
            {
                paciente_id: pacientesFinales[1] ? pacientesFinales[1].id : pacientesFinales[0].id,
                odontologo_id: odontologosFinales[0].id,
                fecha: '2025-08-10',
                hora: '16:00:00',
                estado: 'cancelada',
                motivo: 'Ortodoncia - Primera consulta',
                notas: 'Cancelada por paciente'
            }
        ];
        
        for (const cita of citasEjemplo) {
            await connection.execute(`
                INSERT INTO citas (paciente_id, odontologo_id, fecha, hora, estado, motivo, notas)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [cita.paciente_id, cita.odontologo_id, cita.fecha, cita.hora, cita.estado, cita.motivo, cita.notas]);
        }
        
        console.log(`✅ ${citasEjemplo.length} citas de ejemplo creadas exitosamente`);
        
        // Verificar las citas creadas
        const [citasCreadas] = await connection.execute(`
            SELECT 
                c.id,
                c.fecha,
                c.hora,
                c.estado,
                c.motivo,
                p.nombre as paciente_nombre,
                p.apellido as paciente_apellido,
                o.nombre as odontologo_nombre,
                o.apellido as odontologo_apellido
            FROM citas c
            LEFT JOIN usuarios p ON c.paciente_id = p.id
            LEFT JOIN usuarios o ON c.odontologo_id = o.id
            ORDER BY c.fecha DESC, c.hora DESC
        `);
        
        console.log('\n📋 Citas creadas:');
        citasCreadas.forEach(cita => {
            console.log(`- ID: ${cita.id} | ${cita.fecha} ${cita.hora} | ${cita.estado} | ${cita.paciente_nombre} ${cita.paciente_apellido} con ${cita.odontologo_nombre} ${cita.odontologo_apellido}`);
        });
        
        await connection.end();
        console.log('\n✅ ¡Citas de ejemplo creadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

crearCitasEjemplo();
