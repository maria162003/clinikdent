const db = require('./Backend/config/db');
const fs = require('fs');
const path = require('path');

async function ejecutarScript() {
    try {
        const sqlScript = fs.readFileSync(path.join(__dirname, 'Backend/scripts/crear_tablas_tratamientos.sql'), 'utf8');
        
        // Dividir el script en declaraciones individuales
        const statements = sqlScript.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                console.log('Ejecutando:', statement.substring(0, 50) + '...');
                await db.query(statement);
            }
        }
        
        console.log('✅ Script ejecutado exitosamente');
    } catch (error) {
        console.error('❌ Error ejecutando script:', error);
    } finally {
        process.exit();
    }
}

ejecutarScript();
