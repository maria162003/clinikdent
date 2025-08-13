// Script para insertar citas de prueba
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'clinikdent',
  charset: 'utf8mb4'
});

async function insertarCitasPrueba() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    
    // Primero verificar usuarios existentes
    console.log('👥 Verificando usuarios...');
    const [usuarios] = await connection.promise().query('SELECT id, nombre, apellido, rol FROM usuarios');
    console.log('Usuarios encontrados:', usuarios);
    
    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios. Creando usuarios de prueba...');
      
      // Insertar usuarios de prueba
      await connection.promise().query(`
        INSERT INTO usuarios (nombre, apellido, correo, telefono, password, rol, estado) VALUES
        ('Juan', 'Pérez', 'juan.perez@email.com', '123456789', '$2a$10$hashedpassword', 'paciente', 'activo'),
        ('María', 'García', 'maria.garcia@email.com', '987654321', '$2a$10$hashedpassword', 'paciente', 'activo'),
        ('Dr. Carlos', 'López', 'carlos.lopez@clinica.com', '555-0001', '$2a$10$hashedpassword', 'odontologo', 'activo'),
        ('Dra. Ana', 'Martínez', 'ana.martinez@clinica.com', '555-0002', '$2a$10$hashedpassword', 'odontologo', 'activo')
      `);
      console.log('✅ Usuarios de prueba creados');
      
      // Recargar usuarios
      const [nuevosUsuarios] = await connection.promise().query('SELECT id, nombre, apellido, rol FROM usuarios');
      console.log('Nuevos usuarios:', nuevosUsuarios);
    }
    
    // Verificar si ya hay citas
    const [citasExistentes] = await connection.promise().query('SELECT COUNT(*) as total FROM citas');
    console.log('Citas existentes:', citasExistentes[0].total);
    
    if (citasExistentes[0].total === 0) {
      console.log('📅 Insertando citas de prueba...');
      
      // Obtener IDs de pacientes y odontólogos
      const [pacientes] = await connection.promise().query('SELECT id FROM usuarios WHERE rol = "paciente" LIMIT 2');
      const [odontologos] = await connection.promise().query('SELECT id FROM usuarios WHERE rol = "odontologo" LIMIT 2');
      
      if (pacientes.length > 0 && odontologos.length > 0) {
        const citasPrueba = [
          {
            paciente_id: pacientes[0].id,
            odontologo_id: odontologos[0].id,
            fecha: '2024-12-15',
            hora: '09:00:00',
            estado: 'programada',
            motivo: 'Limpieza dental',
            notas: 'Primera consulta'
          },
          {
            paciente_id: pacientes[1] ? pacientes[1].id : pacientes[0].id,
            odontologo_id: odontologos[1] ? odontologos[1].id : odontologos[0].id,
            fecha: '2024-12-15',
            hora: '10:30:00',
            estado: 'programada',
            motivo: 'Revisión general',
            notas: 'Control rutinario'
          },
          {
            paciente_id: pacientes[0].id,
            odontologo_id: odontologos[0].id,
            fecha: '2024-12-16',
            hora: '14:00:00',
            estado: 'confirmada',
            motivo: 'Endodoncia',
            notas: 'Tratamiento de conducto'
          }
        ];
        
        for (const cita of citasPrueba) {
          await connection.promise().query(
            'INSERT INTO citas (paciente_id, odontologo_id, fecha, hora, estado, motivo, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cita.paciente_id, cita.odontologo_id, cita.fecha, cita.hora, cita.estado, cita.motivo, cita.notas]
          );
        }
        
        console.log('✅ Citas de prueba insertadas exitosamente');
      } else {
        console.log('❌ No se encontraron pacientes y/o odontólogos para crear citas');
      }
    } else {
      console.log('ℹ️ Ya existen citas en la base de datos');
    }
    
    // Verificar las citas insertadas
    const [todasLasCitas] = await connection.promise().query(`
      SELECT 
        c.id, c.fecha, c.hora, c.estado, c.motivo,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        o.nombre as odontologo_nombre, o.apellido as odontologo_apellido
      FROM citas c
      LEFT JOIN usuarios p ON c.paciente_id = p.id
      LEFT JOIN usuarios o ON c.odontologo_id = o.id
    `);
    
    console.log('📋 Citas en la base de datos:');
    console.table(todasLasCitas);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    connection.end();
  }
}

insertarCitasPrueba();
