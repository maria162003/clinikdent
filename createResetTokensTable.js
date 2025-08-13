require('dotenv').config();
const db = require('./Backend/config/db');

async function createResetTokensTable() {
  try {
    console.log('🔗 Creando tabla de tokens de recuperación...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_expires (expires_at),
        INDEX idx_user_id (usuario_id)
      )
    `;
    
    await db.query(createTableSQL);
    console.log('✅ Tabla password_reset_tokens creada correctamente');
    
    // Verificar que se creó
    const [tables] = await db.query("SHOW TABLES LIKE 'password_reset_tokens'");
    if (tables.length > 0) {
      console.log('✅ Tabla verificada exitosamente');
      
      // Mostrar estructura
      const [structure] = await db.query('DESCRIBE password_reset_tokens');
      console.log('🏗️ Estructura de la tabla:');
      structure.forEach(field => {
        console.log(`   ${field.Field} - ${field.Type} - ${field.Null} - ${field.Key} - ${field.Default}`);
      });
    }
    
    await db.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createResetTokensTable();
