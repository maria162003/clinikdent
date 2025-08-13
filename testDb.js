const pool = require('./Backend/config/db');

async function testDatabase() {
  try {
    console.log('🔗 Probando conexión a la base de datos...');
    
    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa');
    
    // Verificar si existe la tabla pqrs
    const [tables] = await connection.execute("SHOW TABLES LIKE 'pqrs'");
    console.log('📋 Tablas encontradas:', tables);
    
    if (tables.length > 0) {
      // Mostrar estructura de la tabla
      const [columns] = await connection.execute("DESCRIBE pqrs");
      console.log('🏗️ Estructura de la tabla pqrs:');
      columns.forEach(col => {
        console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
      });
    } else {
      console.log('❌ La tabla pqrs no existe');
    }
    
    connection.release();
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
