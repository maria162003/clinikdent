// Script para verificar y corregir estructura de tablas
require('dotenv').config();
const mysql = require('mysql2/promise');

async function verificarTablas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clinikdent',
    charset: 'utf8mb4'
  });

  try {
    console.log('✅ Conectado a la base de datos');

    // Verificar estructura de tabla equipos
    const [equiposStructure] = await connection.execute('DESCRIBE equipos');
    console.log('📋 Estructura de tabla equipos:');
    console.table(equiposStructure);

    // Verificar si la columna categoria existe
    const hasCategoria = equiposStructure.some(col => col.Field === 'categoria');
    
    if (!hasCategoria) {
      console.log('⚠️ La columna categoria no existe, agregándola...');
      await connection.execute('ALTER TABLE equipos ADD COLUMN categoria VARCHAR(50) NOT NULL DEFAULT "General"');
      console.log('✅ Columna categoria agregada');
    }

    // Verificar si la columna precio existe
    const hasPrecio = equiposStructure.some(col => col.Field === 'precio');
    
    if (!hasPrecio) {
      console.log('⚠️ La columna precio no existe, agregándola...');
      await connection.execute('ALTER TABLE equipos ADD COLUMN precio DECIMAL(10,2) DEFAULT 0.00');
      console.log('✅ Columna precio agregada');
    }

    // Ahora insertar datos
    const [equiposCount] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    console.log(`📊 Equipos existentes: ${equiposCount[0].total}`);

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
    } else {
      // Actualizar equipos existentes con categorías si no las tienen
      await connection.execute(`
        UPDATE equipos SET 
          categoria = CASE 
            WHEN nombre LIKE '%Sillón%' THEN 'Mobiliario'
            WHEN nombre LIKE '%Compresor%' THEN 'Equipos Base'
            WHEN nombre LIKE '%Autoclave%' THEN 'Esterilización'
            WHEN nombre LIKE '%Lámpara%' OR nombre LIKE '%Fotocurado%' THEN 'Equipos Menores'
            WHEN nombre LIKE '%Ultrasonido%' THEN 'Equipos Menores'
            ELSE 'General'
          END
        WHERE categoria = 'General' OR categoria IS NULL
      `);
      console.log('✅ Categorías actualizadas en equipos existentes');
    }

    // Verificar sedes
    const [sedesCount] = await connection.execute('SELECT COUNT(*) as total FROM sedes');
    console.log(`📊 Sedes existentes: ${sedesCount[0].total}`);

    if (sedesCount[0].total === 0) {
      await connection.execute(`
        INSERT INTO sedes (nombre, direccion, telefono, ciudad, estado) VALUES
        ('Sede Principal', 'Carrera 15 #85-32', '601-2345678', 'Bogotá', 'activa'),
        ('Sede Norte', 'Calle 140 #19-45', '601-2345679', 'Bogotá', 'activa'),
        ('Sede Chapinero', 'Carrera 13 #63-18', '601-2345680', 'Bogotá', 'activa')
      `);
      console.log('✅ Sedes insertadas');
    }

    // Verificar inventario
    const [inventarioCount] = await connection.execute('SELECT COUNT(*) as total FROM inventario_equipos');
    console.log(`📊 Items inventario existentes: ${inventarioCount[0].total}`);

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

    // Mostrar resumen final con datos
    console.log('\n📊 RESUMEN FINAL:');
    
    const [sedesFinal] = await connection.execute('SELECT COUNT(*) as total FROM sedes');
    const [equiposFinal] = await connection.execute('SELECT COUNT(*) as total FROM equipos');
    const [inventarioFinal] = await connection.execute('SELECT COUNT(*) as total FROM inventario_equipos');

    console.log(`   ✅ Sedes: ${sedesFinal[0].total}`);
    console.log(`   ✅ Equipos: ${equiposFinal[0].total}`);
    console.log(`   ✅ Items inventario: ${inventarioFinal[0].total}`);

    // Mostrar algunos datos
    const [inventarioCompleto] = await connection.execute(`
      SELECT 
        ie.id,
        s.nombre as sede,
        e.nombre as equipo,
        e.categoria,
        ie.cantidad
      FROM inventario_equipos ie
      JOIN sedes s ON ie.sede_id = s.id
      JOIN equipos e ON ie.equipo_id = e.id
      LIMIT 5
    `);
    
    console.log('\n🔍 MUESTRA DE INVENTARIO:');
    console.table(inventarioCompleto);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n🎉 Setup completado exitosamente');
  }
}

verificarTablas();
