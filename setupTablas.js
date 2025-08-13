// Script corregido para crear tablas
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

    // Verificar si las tablas existen
    const [tables] = await connection.execute("SHOW TABLES LIKE 'equipos'");
    
    if (tables.length === 0) {
      // Crear tabla equipos
      await connection.execute(`
        CREATE TABLE equipos (
          id INT(11) AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          categoria VARCHAR(50) NOT NULL,
          precio DECIMAL(10,2) DEFAULT 0.00,
          descripcion TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabla equipos creada');
    } else {
      console.log('ℹ️ Tabla equipos ya existe');
    }

    // Insertar equipos si no existen
    const [equiposCount] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    
    if (equiposCount[0].total === 0) {
      await connection.execute(`
        INSERT INTO equipos (nombre, categoria, precio, descripcion) VALUES
        ('Sillón Dental Eléctrico', 'Mobiliario', 2500000.00, 'Sillón dental con sistema eléctrico'),
        ('Compresor de Aire', 'Equipos Base', 800000.00, 'Compresor libre de aceite'),
        ('Autoclave', 'Esterilización', 1200000.00, 'Autoclave de vapor'),
        ('Lámpara de Fotocurado', 'Equipos Menores', 350000.00, 'Lámpara LED para fotocurado'),
        ('Ultrasonido Dental', 'Equipos Menores', 280000.00, 'Equipo de ultrasonido para limpieza')
      `);
      console.log('✅ Equipos insertados');
    }

    // Verificar si tabla sedes existe
    const [sedesTable] = await connection.execute("SHOW TABLES LIKE 'sedes'");
    
    if (sedesTable.length === 0) {
      await connection.execute(`
        CREATE TABLE sedes (
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
    }

    // Insertar sedes si no existen
    const [sedesCount] = await connection.execute('SELECT COUNT(*) as total FROM sedes');
    
    if (sedesCount[0].total === 0) {
      await connection.execute(`
        INSERT INTO sedes (nombre, direccion, telefono, ciudad, estado) VALUES
        ('Sede Principal', 'Carrera 15 #85-32', '601-2345678', 'Bogotá', 'activa'),
        ('Sede Norte', 'Calle 140 #19-45', '601-2345679', 'Bogotá', 'activa'),
        ('Sede Chapinero', 'Carrera 13 #63-18', '601-2345680', 'Bogotá', 'activa')
      `);
      console.log('✅ Sedes insertadas');
    }

    // Verificar tabla inventario_equipos
    const [inventarioTable] = await connection.execute("SHOW TABLES LIKE 'inventario_equipos'");
    
    if (inventarioTable.length === 0) {
      await connection.execute(`
        CREATE TABLE inventario_equipos (
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
    }

    // Insertar inventario si no existe
    const [inventarioCount] = await connection.execute('SELECT COUNT(*) as total FROM inventario_equipos');
    
    if (inventarioCount[0].total === 0) {
      await connection.execute(`
        INSERT INTO inventario_equipos (sede_id, equipo_id, cantidad, descripcion) VALUES
        (1, 1, 3, 'Sillones principales en consultorios'),
        (1, 2, 1, 'Compresor central para toda la sede'),
        (1, 3, 2, 'Autoclave principal y de respaldo'),
        (2, 1, 2, 'Consultorios 1 y 2'),
        (2, 4, 4, 'Lámparas de fotocurado'),
        (3, 1, 1, 'Consultorio especializado'),
        (3, 5, 2, 'Ultrasonidos para limpieza')
      `);
      console.log('✅ Inventario insertado');
    }

    // Verificar resultados finales
    const [sedesFinal] = await connection.execute('SELECT COUNT(*) as total FROM sedes');
    const [equiposFinal] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    const [inventarioFinal] = await connection.execute('SELECT COUNT(*) as total FROM inventario_equipos');

    console.log('📊 RESUMEN:');
    console.log(`   Sedes: ${sedesFinal[0].total}`);
    console.log(`   Equipos: ${equiposFinal[0].total}`);
    console.log(`   Items inventario: ${inventarioFinal[0].total}`);

    // Mostrar algunas consultas de ejemplo
    console.log('\n🔍 DATOS DE EJEMPLO:');
    
    const [sedesData] = await connection.execute('SELECT * FROM sedes LIMIT 3');
    console.log('Sedes:');
    console.table(sedesData);

    const [equiposData] = await connection.execute('SELECT * FROM equipos LIMIT 3');
    console.log('Equipos:');
    console.table(equiposData);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('🔚 Proceso completado');
  }
}

crearTablas();
