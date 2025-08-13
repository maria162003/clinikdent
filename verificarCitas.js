require('dotenv').config();
const db = require('./Backend/config/db');

async function verificarCitas() {
  try {
    console.log('🔗 Verificando tabla de citas...');
    
    // Verificar si existe la tabla citas
    const [tables] = await db.query("SHOW TABLES LIKE 'citas'");
    if (tables.length === 0) {
      console.log('❌ Tabla citas no existe');
      console.log('🔧 Creando tabla citas...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS citas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          paciente_id INT NOT NULL,
          odontologo_id INT NOT NULL,
          fecha DATE NOT NULL,
          hora TIME NOT NULL,
          estado ENUM('programada', 'confirmada', 'completada', 'cancelada') DEFAULT 'programada',
          motivo VARCHAR(255),
          notas TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (odontologo_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          INDEX idx_fecha (fecha),
          INDEX idx_paciente (paciente_id),
          INDEX idx_odontologo (odontologo_id),
          INDEX idx_estado (estado)
        )
      `;
      
      await db.query(createTableSQL);
      console.log('✅ Tabla citas creada correctamente');
    }
    
    console.log('✅ Tabla citas encontrada');
    
    // Mostrar estructura
    const [structure] = await db.query('DESCRIBE citas');
    console.log('🏗️ Estructura de la tabla citas:');
    structure.forEach(field => {
      console.log(`   ${field.Field} - ${field.Type} - ${field.Null} - ${field.Key} - ${field.Default}`);
    });
    
    // Mostrar citas existentes
    const [citas] = await db.query('SELECT c.*, p.nombre as paciente_nombre, o.nombre as odontologo_nombre FROM citas c LEFT JOIN usuarios p ON c.paciente_id = p.id LEFT JOIN usuarios o ON c.odontologo_id = o.id');
    console.log(`\n📅 Citas encontradas: ${citas.length}`);
    citas.forEach(cita => {
      console.log(`   ID: ${cita.id}, Paciente: ${cita.paciente_nombre}, Odontólogo: ${cita.odontologo_nombre}, Fecha: ${cita.fecha}, Hora: ${cita.hora}, Estado: ${cita.estado}`);
    });
    
    await db.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarCitas();
