const db = require('../config/db');

console.log('🆕 NUEVO CONTROLADOR CARGADO - SIN CACHE');

exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, tipo_documento, numero_documento, estado, fecha_registro FROM usuarios ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ msg: 'Error al obtener usuarios.' });
  }
};

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
    console.log('🔍 Datos recibidos en crearUsuario:', req.body);
    
    const { nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, password, tipo_documento, numero_documento } = req.body;
    
    console.log('🔍 Campos extraídos:', {
        nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, password: password ? '***' : 'undefined'
    });
    
    if (!nombre || !apellido || !correo || !rol || !password) {
        console.log('❌ Validación fallida - campos faltantes');
        return res.status(400).json({ msg: 'Nombre, apellido, correo, rol y contraseña son requeridos.' });
    }
    
    try {
        // Verificar si el email ya existe
        const [existing] = await db.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
        if (existing.length > 0) {
            console.log('❌ Email ya existe:', correo);
            return res.status(400).json({ msg: 'El correo electrónico ya está registrado.' });
        }

        console.log('💾 Insertando usuario en la base de datos...');
        // Insertar usuario usando los campos correctos de la tabla
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, contraseña_hash, tipo_documento, numero_documento, fecha_registro, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), "activo")', 
            [nombre, apellido, correo, telefono || null, direccion || null, rol, fecha_nacimiento || null, password, tipo_documento || 'CC', numero_documento || null]
        );
        
        console.log('✅ Usuario creado con ID:', result.insertId);
        res.status(201).json({ 
            msg: 'Usuario creado exitosamente.',
            id: result.insertId 
        });
    } catch (err) {
        console.error('❌ Error al crear usuario:', err);
        res.status(500).json({ msg: 'Error al crear usuario.' });
    }
};

// Actualizar un usuario existente
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, password, tipo_documento, numero_documento } = req.body;
    
    if (!nombre || !apellido || !correo || !rol) {
        return res.status(400).json({ msg: 'Nombre, apellido, correo y rol son requeridos.' });
    }
    
    try {
        // Verificar si el email ya existe en otro usuario
        const [existing] = await db.query('SELECT id FROM usuarios WHERE correo = ? AND id != ?', [correo, id]);
        if (existing.length > 0) {
            console.log('❌ Email ya existe en otro usuario:', correo);
            return res.status(400).json({ msg: 'El correo electrónico ya está registrado por otro usuario.' });
        }

        let query, params;
        if (password) {
            // Si se proporciona nueva contraseña, actualizarla también
            query = 'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, telefono = ?, direccion = ?, rol = ?, fecha_nacimiento = ?, contraseña_hash = ?, tipo_documento = ?, numero_documento = ? WHERE id = ?';
            params = [nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, password, tipo_documento || 'CC', numero_documento, id];
        } else {
            // Si no se proporciona contraseña, mantener la actual
            query = 'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, telefono = ?, direccion = ?, rol = ?, fecha_nacimiento = ?, tipo_documento = ?, numero_documento = ? WHERE id = ?';
            params = [nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento, tipo_documento || 'CC', numero_documento, id];
        }
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }
        
        console.log('✅ Usuario actualizado:', id);
        res.json({ msg: 'Usuario actualizado exitosamente.' });
    } catch (err) {
        console.error('❌ Error al actualizar usuario:', err);
        res.status(500).json({ msg: 'Error al actualizar usuario.' });
    }
};

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }
        
        res.json({ msg: 'Usuario eliminado exitosamente.' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ msg: 'Error al eliminar usuario.' });
    }
};

exports.obtenerPerfil = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id, nombre, apellido, correo, telefono, direccion, rol, fecha_nacimiento FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener perfil.' });
  }
};

exports.actualizarPerfil = async (req, res) => {
  res.status(501).json({ msg: 'Función no implementada en controlador nuevo.' });
};

// Obtener estadísticas para el dashboard
exports.obtenerEstadisticas = async (req, res) => {
  try {
    // Obtener total de pacientes
    const [pacientes] = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE rol = "paciente"');
    
    // Obtener citas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const [citasHoy] = await db.query('SELECT COUNT(*) as total FROM citas WHERE DATE(fecha) = ?', [hoy]);
    
    // Obtener total de odontólogos activos
    const [odontologos] = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE rol = "odontologo" AND estado = "activo"');
    
    // Calcular ingresos del mes (simulado por ahora)
    const ingresosMes = 45230;
    
    res.json({
      totalPacientes: pacientes[0].total,
      citasHoy: citasHoy[0].total,
      ingresosMes: ingresosMes,
      odontologosActivos: odontologos[0].total
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ msg: 'Error al obtener estadísticas.' });
  }
};

// Obtener próximas citas
exports.obtenerProximasCitas = async (req, res) => {
  try {
    const [citas] = await db.query(`
      SELECT c.*, u.nombre as paciente_nombre, u.apellido as paciente_apellido
      FROM citas c
      JOIN usuarios u ON c.paciente_id = u.id
      WHERE c.fecha >= CURDATE()
      ORDER BY c.fecha ASC, c.hora ASC
      LIMIT 5
    `);
    
    // Si no hay citas, devolver datos de ejemplo
    if (citas.length === 0) {
      const citasEjemplo = [
        { paciente_nombre: 'Ana', paciente_apellido: 'García', hora: '09:00', motivo: 'Limpieza' },
        { paciente_nombre: 'Carlos', paciente_apellido: 'López', hora: '10:30', motivo: 'Revisión' },
        { paciente_nombre: 'María', paciente_apellido: 'Rodríguez', hora: '14:00', motivo: 'Endodoncia' }
      ];
      return res.json(citasEjemplo);
    }
    
    res.json(citas);
  } catch (err) {
    console.error('Error al obtener próximas citas:', err);
    res.status(500).json({ msg: 'Error al obtener próximas citas.' });
  }
};

exports.obtenerPacientesOdontologo = async (req, res) => {
  console.log('🧪 NUEVO CONTROLADOR - Función pacientes ejecutada para ID:', req.params.id);
  const { id } = req.params;
  
  try {
    // Query simple para obtener pacientes
    const query = `
      SELECT DISTINCT 
        u.id,
        u.nombre,
        u.apellido,
        u.correo
      FROM usuarios u
      INNER JOIN citas c ON u.id = c.paciente_id
      WHERE c.odontologo_id = ? AND u.rol = 'paciente'
      LIMIT 5
    `;
    
    const [pacientes] = await db.query(query, [id]);
    
    console.log(`✅ NUEVO CONTROLADOR - Encontrados ${pacientes.length} pacientes`);
    
    res.json({
      success: true,
      mensaje: 'Nuevo controlador funcionando correctamente',
      odontologoId: id,
      count: pacientes.length,
      pacientes: pacientes
    });
    
  } catch (err) {
    console.error('❌ NUEVO CONTROLADOR - Error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener pacientes desde nuevo controlador', 
      error: err.message 
    });
  }
};
