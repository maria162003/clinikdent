const db = require('./Backend/config/db');

async function verificarTablaUsuarios() {
    try {
        console.log('🔍 Verificando estructura de la tabla usuarios...');
        
        // Verificar si la tabla existe
        const [tables] = await db.query("SHOW TABLES LIKE 'usuarios'");
        if (tables.length === 0) {
            console.log('❌ La tabla usuarios no existe');
            return;
        }
        
        console.log('✅ La tabla usuarios existe');
        
        // Mostrar estructura de la tabla
        const [columns] = await db.query("DESCRIBE usuarios");
        console.log('📋 Estructura de la tabla usuarios:');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // Verificar si existen las columnas rol y password
        const hasRol = columns.find(col => col.Field === 'rol');
        const hasPassword = columns.find(col => col.Field === 'password');
        
        console.log(`\n🔍 Verificación de columnas:`);
        console.log(`  - rol: ${hasRol ? '✅ existe' : '❌ no existe'}`);
        console.log(`  - password: ${hasPassword ? '✅ existe' : '❌ no existe'}`);
        
        // Mostrar algunos usuarios existentes
        const [users] = await db.query("SELECT id, nombre, apellido, correo, rol FROM usuarios LIMIT 3");
        console.log('\n👥 Usuarios existentes (primeros 3):');
        users.forEach(user => {
            console.log(`  - ID: ${user.id}, Nombre: ${user.nombre} ${user.apellido}, Email: ${user.correo}, Rol: ${user.rol}`);
        });
        
    } catch (err) {
        console.error('❌ Error al verificar tabla:', err);
    } finally {
        process.exit(0);
    }
}

verificarTablaUsuarios();
