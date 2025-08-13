// Script para crear las tablas de inventario y sedes
require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinikdent',
  charset: 'utf8mb4',
  multipleStatements: true
});

async function crearTablasInventario() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Error de conexión:', err.message);
          reject(err);
        } else {
          console.log('✅ Conexión exitosa a MariaDB');
          resolve();
        }
      });
    });
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'Backend', 'scripts', 'crear_tablas_inventario_sedes.sql');
    console.log('📄 Leyendo archivo SQL:', sqlPath);
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('📜 Archivo SQL leído correctamente');
    
    // Ejecutar el script SQL
    console.log('🚀 Ejecutando script de creación de tablas...');
    
    await new Promise((resolve, reject) => {
      connection.query(sqlContent, (err, results) => {
        if (err) {
          console.error('❌ Error al ejecutar script:', err.message);
          reject(err);
        } else {
          console.log('✅ Script ejecutado correctamente');
          
          // Mostrar resultados
          if (Array.isArray(results)) {
            results.forEach((result, index) => {
              if (result && result.length > 0) {
                console.log(`📊 Resultado ${index + 1}:`);
                console.table(result);
              }
            });
          }
          
          resolve(results);
        }
      });
    });
    
    // Verificar que las tablas se crearon correctamente
    console.log('🔍 Verificando tablas creadas...');
    
    const tables = ['sedes', 'equipos', 'inventario_equipos'];
    for (const table of tables) {
      const [result] = await connection.promise().query(`SHOW TABLES LIKE '${table}'`);
      if (result.length > 0) {
        console.log(`✅ Tabla ${table} creada correctamente`);
        
        // Contar registros
        const [count] = await connection.promise().query(`SELECT COUNT(*) as total FROM ${table}`);
        console.log(`   📊 Registros en ${table}: ${count[0].total}`);
      } else {
        console.log(`❌ Tabla ${table} NO fue creada`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    connection.end();
    console.log('🔚 Conexión cerrada');
  }
}

crearTablasInventario();
