const db = require('./Backend/config/db');

(async () => {
  try {
    console.log('📋 Verificando estructura de la tabla usuarios...');
    const [resultado] = await db.query('DESCRIBE usuarios');
    console.log('\n🏗️ Estructura de la tabla usuarios:');
    resultado.forEach(campo => {
      console.log(`- ${campo.Field}: ${campo.Type} ${campo.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${campo.Key ? `(${campo.Key})` : ''}`);
    });
    
    console.log('\n👤 Ejemplo de usuarios existentes:');
    const [usuarios] = await db.query('SELECT id, nombre, apellido, correo, telefono, direccion, rol FROM usuarios LIMIT 3');
    usuarios.forEach(usuario => {
      console.log(`- ID: ${usuario.id}, Nombre: ${usuario.nombre} ${usuario.apellido}, Correo: ${usuario.correo}, Teléfono: ${usuario.telefono || 'Sin teléfono'}, Dirección: ${usuario.direccion || 'Sin dirección'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
