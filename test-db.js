const pool = require('./Backend/config/db'); // <-- ruta correcta


(async () => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS db');
    console.log('Conectado a la base:', rows[0].db);
    process.exit(0);
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
})();
