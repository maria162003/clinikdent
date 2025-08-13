const mysql = require('mysql2');

// Configuración de conexión directa
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clinikdent'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos');

    // Verificar estructura actual
    connection.query('DESCRIBE usuarios', (err, results) => {
        if (err) {
            console.error('❌ Error describiendo tabla:', err);
            connection.end();
            return;
        }

        console.log('📋 Columnas actuales:');
        results.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type}`);
        });

        // Verificar si existe password
        const hasPassword = results.find(col => col.Field === 'password');
        const hasEstado = results.find(col => col.Field === 'estado');

        let queries = [];

        if (!hasPassword) {
            queries.push('ALTER TABLE usuarios ADD COLUMN password VARCHAR(255) DEFAULT NULL');
        }

        if (!hasEstado) {
            queries.push('ALTER TABLE usuarios ADD COLUMN estado VARCHAR(20) DEFAULT "activo"');
        }

        if (queries.length === 0) {
            console.log('✅ Todas las columnas ya existen');
            connection.end();
            return;
        }

        // Ejecutar queries
        let completed = 0;
        queries.forEach((query, index) => {
            connection.query(query, (err, result) => {
                if (err) {
                    console.error(`❌ Error ejecutando query ${index + 1}:`, err);
                } else {
                    console.log(`✅ Query ${index + 1} ejecutada correctamente`);
                }

                completed++;
                if (completed === queries.length) {
                    console.log('🎉 Todas las columnas agregadas exitosamente');
                    connection.end();
                }
            });
        });
    });
});
