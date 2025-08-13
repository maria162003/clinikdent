// Script rápido para crear las tablas necesarias
require('dotenv').config();
const mysql = require('mysql2/promise');

async function crearTablas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clinikdent',
    charset: 'utf8mb4'
  });

  try {
    console.log('✅ Conectado a la base de datos');

    // Crear tabla sedes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sedes (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        telefono VARCHAR(20),
        ciudad VARCHAR(100) NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        estado ENUM('activa', 'inactiva') DEFAULT 'activa'
      )
    `);
    console.log('✅ Tabla sedes creada');

    // Crear tabla equipos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS equipos (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        precio DECIMAL(10,2) DEFAULT 0.00,
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla equipos creada');

    // Crear tabla inventario_equipos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventario_equipos (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        sede_id INT(11) NOT NULL,
        equipo_id INT(11) NOT NULL,
        cantidad INT(11) NOT NULL DEFAULT 0,
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla inventario_equipos creada');

    // Insertar datos de ejemplo
    await connection.execute(`
      INSERT IGNORE INTO sedes (id, nombre, direccion, telefono, ciudad, estado) VALUES
      (1, 'Sede Principal', 'Carrera 15 #85-32', '601-2345678', 'Bogotá', 'activa'),
      (2, 'Sede Norte', 'Calle 140 #19-45', '601-2345679', 'Bogotá', 'activa'),
      (3, 'Sede Chapinero', 'Carrera 13 #63-18', '601-2345680', 'Bogotá', 'activa')
    `);

    await connection.execute(`
      INSERT IGNORE INTO equipos (id, nombre, categoria, precio, descripcion) VALUES
      (1, 'Sillón Dental Eléctrico', 'Mobiliario', 2500000.00, 'Sillón dental con sistema eléctrico'),
      (2, 'Compresor de Aire', 'Equipos Base', 800000.00, 'Compresor libre de aceite'),
      (3, 'Autoclave', 'Esterilización', 1200000.00, 'Autoclave de vapor'),
      (4, 'Lámpara de Fotocurado', 'Equipos Menores', 350000.00, 'Lámpara LED para fotocurado'),
      (5, 'Ultrasonido Dental', 'Equipos Menores', 280000.00, 'Equipo de ultrasonido para limpieza')
    `);

    await connection.execute(`
      INSERT IGNORE INTO inventario_equipos (sede_id, equipo_id, cantidad, descripcion) VALUES
      (1, 1, 3, 'Sillones principales'),
      (1, 2, 1, 'Compresor central'),
      (1, 3, 2, 'Autoclave principal y respaldo'),
      (2, 1, 2, 'Consultorios 1 y 2'),
      (2, 4, 4, 'Lámparas de fotocurado'),
      (3, 1, 1, 'Consultorio especializado'),
      (3, 5, 2, 'Ultrasonidos')
    `);

    console.log('✅ Datos de ejemplo insertados');

    // Verificar
    const [sedes] = await connection.execute('SELECT COUNT(*) as total FROM sedes');
    const [equipos] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    const [inventario] = await connection.execute('SELECT COUNT(*) as total FROM inventario_equipos');

    console.log(`📊 Sedes: ${sedes[0].total}`);
    console.log(`📊 Equipos: ${equipos[0].total}`);
    console.log(`📊 Items inventario: ${inventario[0].total}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

crearTablas();
