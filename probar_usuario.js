const db = require('./Backend/config/db');

async function probarCreacionUsuario() {
    try {
        console.log('🧪 Probando creación de usuario...');
        
        const usuarioPrueba = {
            nombre: 'Usuario',
            apellido: 'Prueba',
            correo: 'usuario.prueba@test.com',
            telefono: '1234567890',
            direccion: 'Dirección de prueba',
            rol: 'paciente',
            fecha_nacimiento: '1990-01-01',
            password: 'password123'
        };
        
        console.log('📋 Datos a insertar:', usuarioPrueba);
        
        // Intentar insertar directamente
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, password, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "activo")', 
            [usuarioPrueba.nombre, usuarioPrueba.apellido, usuarioPrueba.correo, usuarioPrueba.telefono, usuarioPrueba.direccion, usuarioPrueba.rol, usuarioPrueba.fecha_nacimiento, usuarioPrueba.password]
        );
        
        console.log('✅ Usuario creado con ID:', result.insertId);
        
        // Verificar que se insertó correctamente
        const [usuario] = await db.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);
        console.log('📋 Usuario insertado:', usuario[0]);
        
    } catch (err) {
        console.error('❌ Error al crear usuario:', err);
    } finally {
        process.exit(0);
    }
}

probarCreacionUsuario();
