const mysql = require('mysql2');

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

        // Verificar si existe la columna duplicada password
        const hasPassword = results.find(col => col.Field === 'password');

        if (hasPassword) {
            console.log('🗑️ Eliminando columna duplicada "password"...');
            connection.query('ALTER TABLE usuarios DROP COLUMN password', (err, result) => {
                if (err) {
                    console.error('❌ Error eliminando columna password:', err);
                } else {
                    console.log('✅ Columna "password" eliminada correctamente');
                }

                // Mostrar estructura final
                connection.query('DESCRIBE usuarios', (err, finalResults) => {
                    if (!err) {
                        console.log('\n📋 Estructura final de la tabla usuarios:');
                        finalResults.forEach(col => {
                            console.log(`  - ${col.Field}: ${col.Type}`);
                        });
                    }
                    connection.end();
                });
            });
        } else {
            console.log('✅ No hay columna duplicada "password"');
            connection.end();
        }
    });
});
