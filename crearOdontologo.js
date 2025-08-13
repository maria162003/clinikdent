require('dotenv').config();
const db = require('./Backend/config/db');
const bcrypt = require('bcryptjs');

async function crearOdontologo() {
  try {
    console.log('🦷 Creando odontólogo de prueba...');
    
    const email = 'dr.garcia@clinikdent.com';
    const password = '123456';
    const nombre = 'Dr. Juan';
    const apellido = 'García';
    
    // Verificar si ya existe
    const [existe] = await db.query('SELECT id FROM usuarios WHERE correo = ?', [email]);
    if (existe.length > 0) {
      console.log('ℹ️ Odontólogo ya existe, actualizando...');
      // Actualizar datos
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('UPDATE usuarios SET contraseña_hash = ?, estado = ? WHERE correo = ?', [hashedPassword, 'activo', email]);
      console.log('✅ Odontólogo actualizado');
    } else {
      // Crear odontólogo nuevo
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(`
        INSERT INTO usuarios (rol, nombre, apellido, correo, contraseña_hash, telefono, numero_documento, tipo_documento, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['odontologo', nombre, apellido, email, hashedPassword, '3001234567', '87654321', 'CC', 'activo']);
      console.log('✅ Odontólogo creado');
    }
    
    console.log('📋 Datos del odontólogo:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Rol: odontologo`);
    
    await db.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

crearOdontologo();
