require('dotenv').config();
const db = require('./Backend/config/db');

async function verificarDatos() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');
    
    // Verificar usuarios
    console.log('👥 USUARIOS:');
    const [usuarios] = await db.query('SELECT id, rol, nombre, apellido, correo, estado FROM usuarios ORDER BY rol, id');
    usuarios.forEach(user => {
      console.log(`  ID: ${user.id} | ${user.rol.toUpperCase()} | ${user.nombre} ${user.apellido} | ${user.correo} | Estado: ${user.estado}`);
    });
    
    // Verificar estructura de tabla citas
    console.log('\n📋 ESTRUCTURA TABLA CITAS:');
    const [estructura] = await db.query('DESCRIBE citas');
    estructura.forEach(col => {
      console.log(`  ${col.Field} | ${col.Type} | Null: ${col.Null} | Key: ${col.Key || 'N/A'} | Default: ${col.Default || 'N/A'}`);
    });
    
    // Verificar citas existentes
    console.log('\n📅 CITAS EXISTENTES:');
    const [citas] = await db.query(`
      SELECT 
        c.id, c.paciente_id, c.odontologo_id, c.fecha, c.hora, c.estado, c.motivo,
        p.nombre as paciente_nombre, p.apellido as paciente_apellido,
        o.nombre as odontologo_nombre, o.apellido as odontologo_apellido
      FROM citas c
      LEFT JOIN usuarios p ON c.paciente_id = p.id
      LEFT JOIN usuarios o ON c.odontologo_id = o.id
      ORDER BY c.fecha DESC, c.hora DESC
    `);
    
    if (citas.length === 0) {
      console.log('  No hay citas registradas');
    } else {
      citas.forEach(cita => {
        console.log(`  ID: ${cita.id} | ${cita.paciente_nombre} ${cita.paciente_apellido} -> Dr. ${cita.odontologo_nombre} ${cita.odontologo_apellido}`);
        console.log(`    Fecha: ${cita.fecha} ${cita.hora} | Estado: ${cita.estado} | Motivo: ${cita.motivo || 'N/A'}`);
      });
    }
    
    await db.end();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarDatos();
