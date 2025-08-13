// Backend/controllers/inventarioController.js
const db = require('../config/db');

/**
 * GET /api/inventario
 * Obtiene todo el inventario con información de sedes
 */
exports.obtenerInventario = async (req, res) => {
  console.log('📦 [inventarioController] Obteniendo inventario completo');
  
  try {
    const query = `
      SELECT 
        ie.id,
        ie.sede_id,
        ie.equipo_id,
        ie.cantidad,
        ie.descripcion,
        s.nombre as sede_nombre,
        s.ciudad as sede_ciudad,
        e.nombre as equipo_nombre,
        e.categoria as equipo_categoria,
        e.precio as equipo_precio
      FROM inventario_equipos ie
      LEFT JOIN sedes s ON ie.sede_id = s.id
      LEFT JOIN equipos e ON ie.equipo_id = e.id
      ORDER BY s.nombre, e.nombre
    `;
    
    const [inventario] = await db.query(query);
    console.log(`✅ Items de inventario encontrados: ${inventario.length}`);
    
    return res.json(inventario);
  } catch (err) {
    console.error('❌ Error en obtenerInventario:', err);
    return res.status(500).json({ msg: 'Error al obtener inventario.', error: err.message });
  }
};

/**
 * GET /api/inventario/sede/:sede_id
 * Obtiene inventario de una sede específica
 */
exports.obtenerInventarioPorSede = async (req, res) => {
  const { sede_id } = req.params;
  console.log(`📦 [inventarioController] Obteniendo inventario de sede: ${sede_id}`);
  
  try {
    const query = `
      SELECT 
        ie.id,
        ie.equipo_id,
        ie.cantidad,
        ie.descripcion,
        e.nombre as equipo_nombre,
        e.categoria as equipo_categoria,
        e.precio as equipo_precio
      FROM inventario_equipos ie
      LEFT JOIN equipos e ON ie.equipo_id = e.id
      WHERE ie.sede_id = ?
      ORDER BY e.nombre
    `;
    
    const [inventario] = await db.query(query, [sede_id]);
    console.log(`✅ Items encontrados para sede ${sede_id}: ${inventario.length}`);
    
    return res.json(inventario);
  } catch (err) {
    console.error('❌ Error en obtenerInventarioPorSede:', err);
    return res.status(500).json({ msg: 'Error al obtener inventario de la sede.', error: err.message });
  }
};

/**
 * POST /api/inventario
 * Agregar item al inventario
 */
exports.agregarItemInventario = async (req, res) => {
  console.log('🆕 [inventarioController] Agregando item al inventario');
  console.log('📋 Body recibido:', req.body);
  
  const { sede_id, equipo_id, cantidad, descripcion } = req.body;
  
  if (!sede_id || !equipo_id || !cantidad) {
    return res.status(400).json({ msg: 'Datos incompletos. Se requiere sede_id, equipo_id y cantidad.' });
  }
  
  try {
    // Verificar si ya existe el equipo en esa sede
    const [existente] = await db.query(
      'SELECT id, cantidad FROM inventario_equipos WHERE sede_id = ? AND equipo_id = ?',
      [sede_id, equipo_id]
    );
    
    if (existente.length > 0) {
      // Si existe, actualizar cantidad
      const nuevaCantidad = existente[0].cantidad + parseInt(cantidad);
      await db.query(
        'UPDATE inventario_equipos SET cantidad = ?, descripcion = ? WHERE id = ?',
        [nuevaCantidad, descripcion || null, existente[0].id]
      );
      
      console.log('✅ Cantidad actualizada para item existente:', existente[0].id);
      return res.json({ 
        msg: 'Cantidad actualizada en inventario.',
        itemId: existente[0].id,
        nuevaCantidad: nuevaCantidad
      });
    } else {
      // Si no existe, crear nuevo
      const insertQuery = `
        INSERT INTO inventario_equipos (sede_id, equipo_id, cantidad, descripcion)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await db.query(insertQuery, [sede_id, equipo_id, cantidad, descripcion || null]);
      console.log('✅ Item agregado al inventario con ID:', result.insertId);
      
      return res.json({ 
        msg: 'Item agregado al inventario correctamente.',
        itemId: result.insertId
      });
    }
  } catch (err) {
    console.error('❌ Error al agregar item al inventario:', err);
    return res.status(500).json({ msg: 'Error al agregar item al inventario.', error: err.message });
  }
};

/**
 * PUT /api/inventario/:id
 * Actualizar item del inventario
 */
exports.actualizarItemInventario = async (req, res) => {
  console.log('🔄 [inventarioController] Actualizando item del inventario');
  
  const { id } = req.params;
  const { sede_id, equipo_id, cantidad, descripcion } = req.body;
  
  if (!sede_id || !equipo_id || !cantidad) {
    return res.status(400).json({ msg: 'Datos incompletos.' });
  }
  
  try {
    const updateQuery = `
      UPDATE inventario_equipos 
      SET sede_id = ?, equipo_id = ?, cantidad = ?, descripcion = ?
      WHERE id = ?
    `;
    
    const [result] = await db.query(updateQuery, [sede_id, equipo_id, cantidad, descripcion, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Item no encontrado.' });
    }
    
    console.log('✅ Item del inventario actualizado:', id);
    return res.json({ msg: 'Item actualizado correctamente.' });
  } catch (err) {
    console.error('❌ Error al actualizar item del inventario:', err);
    return res.status(500).json({ msg: 'Error al actualizar item del inventario.', error: err.message });
  }
};

/**
 * DELETE /api/inventario/:id
 * Eliminar item del inventario
 */
exports.eliminarItemInventario = async (req, res) => {
  console.log('🗑️ [inventarioController] Eliminando item del inventario');
  
  const { id } = req.params;
  
  try {
    const deleteQuery = 'DELETE FROM inventario_equipos WHERE id = ?';
    const [result] = await db.query(deleteQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Item no encontrado.' });
    }
    
    console.log('✅ Item del inventario eliminado:', id);
    return res.json({ msg: 'Item eliminado correctamente.' });
  } catch (err) {
    console.error('❌ Error al eliminar item del inventario:', err);
    return res.status(500).json({ msg: 'Error al eliminar item del inventario.', error: err.message });
  }
};

/**
 * GET /api/inventario/equipos
 * Obtener lista de equipos disponibles
 */
exports.obtenerEquipos = async (req, res) => {
  console.log('🔧 [inventarioController] Obteniendo lista de equipos');
  
  try {
    const query = `
      SELECT 
        id,
        nombre,
        categoria,
        precio,
        descripcion
      FROM equipos
      ORDER BY categoria, nombre
    `;
    
    const [equipos] = await db.query(query);
    console.log(`✅ Equipos encontrados: ${equipos.length}`);
    
    return res.json(equipos);
  } catch (err) {
    console.error('❌ Error en obtenerEquipos:', err);
    return res.status(500).json({ msg: 'Error al obtener equipos.', error: err.message });
  }
};

/**
 * GET /api/inventario/estadisticas
 * Obtener estadísticas del inventario
 */
exports.obtenerEstadisticasInventario = async (req, res) => {
  console.log('📊 [inventarioController] Obteniendo estadísticas del inventario');
  
  try {
    // Total de items por sede
    const [totalPorSede] = await db.query(`
      SELECT 
        s.nombre as sede,
        COUNT(ie.id) as total_items,
        SUM(ie.cantidad) as total_cantidad
      FROM sedes s
      LEFT JOIN inventario_equipos ie ON s.id = ie.sede_id
      GROUP BY s.id, s.nombre
    `);
    
    // Total de equipos por categoría
    const [totalPorCategoria] = await db.query(`
      SELECT 
        e.categoria,
        COUNT(ie.id) as total_items,
        SUM(ie.cantidad) as total_cantidad
      FROM equipos e
      LEFT JOIN inventario_equipos ie ON e.id = ie.equipo_id
      GROUP BY e.categoria
    `);
    
    // Valor total del inventario
    const [valorTotal] = await db.query(`
      SELECT 
        SUM(ie.cantidad * e.precio) as valor_total
      FROM inventario_equipos ie
      LEFT JOIN equipos e ON ie.equipo_id = e.id
    `);
    
    const estadisticas = {
      totalPorSede,
      totalPorCategoria,
      valorTotal: valorTotal[0].valor_total || 0
    };
    
    console.log('✅ Estadísticas calculadas');
    return res.json(estadisticas);
  } catch (err) {
    console.error('❌ Error en obtenerEstadisticasInventario:', err);
    return res.status(500).json({ msg: 'Error al obtener estadísticas.', error: err.message });
  }
};

// Mantener compatibilidad con métodos anteriores
exports.crearElemento = exports.agregarItemInventario;
exports.actualizarElemento = exports.actualizarItemInventario;
exports.eliminarElemento = exports.eliminarItemInventario;