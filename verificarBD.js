// Script simple para verificar la estructura de la base de datos
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'clinikdent',
  charset: 'utf8mb4'
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err.message);
    return;
  }
  
  console.log('✅ Conexión exitosa a MariaDB.');
  
  // Verificar tablas existentes
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error al obtener tablas:', err.message);
      return;
    }
    
    console.log('📋 Tablas en la base de datos:');
    results.forEach(row => console.log('-', Object.values(row)[0]));
    
    // Verificar estructura de la tabla citas
    connection.query('DESCRIBE citas', (err, results) => {
      if (err) {
        console.error('❌ Error al describir tabla citas:', err.message);
        console.log('ℹ️ La tabla citas no existe. Creándola...');
        
        // Crear tabla citas
        const createTableQuery = `
          CREATE TABLE citas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            paciente_id INT NOT NULL,
            odontologo_id INT NOT NULL,
            fecha DATE NOT NULL,
            hora TIME NOT NULL,
            estado ENUM('programada', 'confirmada', 'en_curso', 'completada', 'cancelada') DEFAULT 'programada',
            motivo TEXT,
            notas TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
            FOREIGN KEY (odontologo_id) REFERENCES usuarios(id)
          )
        `;
        
        connection.query(createTableQuery, (err, result) => {
          if (err) {
            console.error('❌ Error al crear tabla citas:', err.message);
          } else {
            console.log('✅ Tabla citas creada exitosamente');
          }
          connection.end();
        });
      } else {
        console.log('📋 Estructura de la tabla citas:');
        console.table(results);
        
        // Contar registros
        connection.query('SELECT COUNT(*) as total FROM citas', (err, results) => {
          if (err) {
            console.error('Error al contar citas:', err.message);
          } else {
            console.log(`📊 Total de citas: ${results[0].total}`);
          }
          connection.end();
        });
      }
    });
  });
});
