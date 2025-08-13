const db = require('./Backend/config/db');

async function agregarColumnasUsuarios() {
    try {
        console.log('🔧 Verificando y agregando columnas faltantes a la tabla usuarios...');
        
        // Verificar estructura actual
        const [columns] = await db.query("DESCRIBE usuarios");
        console.log('📋 Columnas actuales:');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type}`);
        });
        
        // Verificar si existe la columna password
        const hasPassword = columns.find(col => col.Field === 'password');
        
        if (!hasPassword) {
            console.log('➕ Agregando columna password...');
            await db.query("ALTER TABLE usuarios ADD COLUMN password VARCHAR(255) DEFAULT NULL");
            console.log('✅ Columna password agregada');
        } else {
            console.log('✅ La columna password ya existe');
        }
        
        // Verificar si existe la columna estado
        const hasEstado = columns.find(col => col.Field === 'estado');
        
        if (!hasEstado) {
            console.log('➕ Agregando columna estado...');
            await db.query("ALTER TABLE usuarios ADD COLUMN estado VARCHAR(20) DEFAULT 'activo'");
            console.log('✅ Columna estado agregada');
        } else {
            console.log('✅ La columna estado ya existe');
        }
        
        // Mostrar estructura final
        const [finalColumns] = await db.query("DESCRIBE usuarios");
        console.log('\n📋 Estructura final de la tabla usuarios:');
        finalColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
        });
        
        console.log('\n✅ Tabla usuarios actualizada correctamente');
        
    } catch (err) {
        console.error('❌ Error al actualizar tabla:', err);
    } finally {
        process.exit(0);
    }
}

agregarColumnasUsuarios();
