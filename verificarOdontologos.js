const db = require('./Backend/config/db');

(async () => {
  try {
    console.log('🦷 Verificando odontólogos disponibles...');
    const [odontologos] = await db.query('SELECT id, nombre, apellido, rol FROM usuarios WHERE rol = "odontologo"');
    console.log('Odontólogos disponibles:');
    odontologos.forEach(odontologo => {
      console.log(`- ID: ${odontologo.id}, Nombre: ${odontologo.nombre} ${odontologo.apellido}`);
    });
    
    console.log('\n👤 Verificando todos los usuarios...');
    const [usuarios] = await db.query('SELECT id, nombre, apellido, rol FROM usuarios ORDER BY id');
    usuarios.forEach(usuario => {
      console.log(`- ID: ${usuario.id}, Nombre: ${usuario.nombre} ${usuario.apellido}, Rol: ${usuario.rol}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
