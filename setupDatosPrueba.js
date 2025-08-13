// Script para verificar y crear datos de prueba usando la configuración del .env
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinikdent',
  charset: 'utf8mb4'
});

async function verificarYCrearDatos() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    console.log('📋 Configuración DB:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD ? '***' : '(vacía)'
    });
    
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Error de conexión:', err.message);
          reject(err);
        } else {
          console.log('✅ Conexión exitosa a MariaDB');
          resolve();
        }
      });
    });
    
    // Verificar tabla usuarios
    console.log('👥 Verificando usuarios...');
    const [usuarios] = await connection.promise().query('SELECT id, nombre, apellido, rol FROM usuarios LIMIT 5');
    console.log('Usuarios encontrados:', usuarios.length);
    
    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios. Es necesario crear usuarios primero.');
      
      // Crear usuarios de prueba
      console.log('🆕 Creando usuarios de prueba...');
      await connection.promise().query(`
        INSERT INTO usuarios (nombre, apellido, correo, telefono, password, rol, estado) VALUES
        ('Juan', 'Pérez', 'juan.perez@email.com', '123456789', '$2a$10$hashedpassword', 'paciente', 'activo'),
        ('María', 'García', 'maria.garcia@email.com', '987654321', '$2a$10$hashedpassword', 'paciente', 'activo'),
        ('Dr. Carlos', 'López', 'carlos.lopez@clinica.com', '555-0001', '$2a$10$hashedpassword', 'odontologo', 'activo'),
        ('Dra. Ana', 'Martínez', 'ana.martinez@clinica.com', '555-0002', '$2a$10$hashedpassword', 'odontologo', 'activo')
      `);
      console.log('✅ Usuarios creados');
      
      // Recargar usuarios
      const [nuevosUsuarios] = await connection.promise().query('SELECT id, nombre, apellido, rol FROM usuarios');
      console.log('Nuevos usuarios:', nuevosUsuarios.length);
    }
    
    // Verificar tabla citas
    console.log('📅 Verificando citas...');
    const [citas] = await connection.promise().query('SELECT COUNT(*) as total FROM citas');
    console.log('Citas existentes:', citas[0].total);
    
    if (citas[0].total === 0) {
      console.log('📝 Creando citas de prueba...');
      
      // Obtener usuarios para las citas
      const [pacientes] = await connection.promise().query('SELECT id FROM usuarios WHERE rol = "paciente" LIMIT 2');
      const [odontologos] = await connection.promise().query('SELECT id FROM usuarios WHERE rol = "odontologo" LIMIT 2');
      
      console.log('Pacientes disponibles:', pacientes.length);
      console.log('Odontólogos disponibles:', odontologos.length);
      
      if (pacientes.length > 0 && odontologos.length > 0) {
        // Insertar citas de prueba
        const hoy = new Date();
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);
        
        const citasPrueba = [
          [pacientes[0].id, odontologos[0].id, hoy.toISOString().split('T')[0], '09:00:00', 'programada', 'Limpieza dental', 'Primera consulta'],
          [pacientes[1] ? pacientes[1].id : pacientes[0].id, odontologos[0].id, hoy.toISOString().split('T')[0], '10:30:00', 'confirmada', 'Revisión general', 'Control rutinario'],
          [pacientes[0].id, odontologos[1] ? odontologos[1].id : odontologos[0].id, mañana.toISOString().split('T')[0], '14:00:00', 'programada', 'Endodoncia', 'Tratamiento de conducto']
        ];
        
        for (const cita of citasPrueba) {
          await connection.promise().query(
            'INSERT INTO citas (paciente_id, odontologo_id, fecha, hora, estado, motivo, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
            cita
          );
        }
        
        console.log('✅ Citas de prueba creadas');
      }
    }
    
    // Mostrar todas las citas
    console.log('📋 Consultando todas las citas...');
    const [todasCitas] = await connection.promise().query(`
      SELECT 
        c.id, c.fecha, c.hora, c.estado, c.motivo,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        o.nombre as odontologo_nombre, o.apellido as odontologo_apellido
      FROM citas c
      LEFT JOIN usuarios p ON c.paciente_id = p.id
      LEFT JOIN usuarios o ON c.odontologo_id = o.id
      ORDER BY c.fecha, c.hora
    `);
    
    console.log(`📊 Total de citas: ${todasCitas.length}`);
    console.table(todasCitas);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    connection.end();
    console.log('🔚 Conexión cerrada');
  }
}

verificarYCrearDatos();
