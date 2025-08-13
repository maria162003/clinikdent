// Script simple para crear tablas
require('dotenv').config();
const mysql = require('mysql2');

console.log('🚀 Iniciando script de creación de tablas...');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinikdent',
  charset: 'utf8mb4'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
    return;
  }
  
  console.log('✅ Conectado a la base de datos');
  
  // Crear tabla sedes
  const createSedesTable = `
    CREATE TABLE IF NOT EXISTS sedes (
      id INT(11) AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      direccion VARCHAR(200) NOT NULL,
      telefono VARCHAR(20),
      ciudad VARCHAR(100) NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      estado ENUM('activa', 'inactiva') DEFAULT 'activa'
    )
  `;
  
  connection.query(createSedesTable, (err) => {
    if (err) {
      console.error('❌ Error creando tabla sedes:', err.message);
    } else {
      console.log('✅ Tabla sedes creada');
    }
    
    // Crear tabla equipos
    const createEquiposTable = `
      CREATE TABLE IF NOT EXISTS equipos (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        precio DECIMAL(10,2) DEFAULT 0.00,
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    connection.query(createEquiposTable, (err) => {
      if (err) {
        console.error('❌ Error creando tabla equipos:', err.message);
      } else {
        console.log('✅ Tabla equipos creada');
      }
      
      // Crear tabla inventario_equipos
      const createInventarioTable = `
        CREATE TABLE IF NOT EXISTS inventario_equipos (
          id INT(11) AUTO_INCREMENT PRIMARY KEY,
          sede_id INT(11) NOT NULL,
          equipo_id INT(11) NOT NULL,
          cantidad INT(11) NOT NULL DEFAULT 0,
          descripcion TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createInventarioTable, (err) => {
        if (err) {
          console.error('❌ Error creando tabla inventario_equipos:', err.message);
        } else {
          console.log('✅ Tabla inventario_equipos creada');
        }
        
        // Insertar datos de ejemplo
        insertarDatosEjemplo();
      });
    });
  });
});

function insertarDatosEjemplo() {
  console.log('📝 Insertando datos de ejemplo...');
  
  // Insertar sedes
  const insertSedes = `
    INSERT IGNORE INTO sedes (nombre, direccion, telefono, ciudad, estado) VALUES
    ('Sede Principal', 'Carrera 15 #85-32', '601-2345678', 'Bogotá', 'activa'),
    ('Sede Norte', 'Calle 140 #19-45', '601-2345679', 'Bogotá', 'activa'),
    ('Sede Chapinero', 'Carrera 13 #63-18', '601-2345680', 'Bogotá', 'activa')
  `;
  
  connection.query(insertSedes, (err) => {
    if (err) {
      console.error('❌ Error insertando sedes:', err.message);
    } else {
      console.log('✅ Sedes insertadas');
    }
    
    // Insertar equipos
    const insertEquipos = `
      INSERT IGNORE INTO equipos (nombre, categoria, precio, descripcion) VALUES
      ('Sillón Dental Eléctrico', 'Mobiliario', 2500000.00, 'Sillón dental con sistema eléctrico'),
      ('Compresor de Aire', 'Equipos Base', 800000.00, 'Compresor libre de aceite'),
      ('Autoclave', 'Esterilización', 1200000.00, 'Autoclave de vapor'),
      ('Lámpara de Fotocurado', 'Equipos Menores', 350000.00, 'Lámpara LED para fotocurado'),
      ('Ultrasonido Dental', 'Equipos Menores', 280000.00, 'Equipo de ultrasonido para limpieza')
    `;
    
    connection.query(insertEquipos, (err) => {
      if (err) {
        console.error('❌ Error insertando equipos:', err.message);
      } else {
        console.log('✅ Equipos insertados');
      }
      
      // Verificar datos
      verificarDatos();
    });
  });
}

function verificarDatos() {
  console.log('🔍 Verificando datos insertados...');
  
  connection.query('SELECT COUNT(*) as total FROM sedes', (err, results) => {
    if (!err) {
      console.log(`📊 Total sedes: ${results[0].total}`);
    }
  });
  
  connection.query('SELECT COUNT(*) as total FROM equipos', (err, results) => {
    if (!err) {
      console.log(`📊 Total equipos: ${results[0].total}`);
    }
    
    // Cerrar conexión
    connection.end();
    console.log('🔚 Script completado');
  });
}
