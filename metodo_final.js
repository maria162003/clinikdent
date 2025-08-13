/**
 * PATCH /api/citas/:id_cita/reasignar
 * Reasignar odontólogo a una cita
 */
exports.reasignarOdontologo = async (req, res) => {
  console.log('🔄 [citaController] Reasignando odontólogo');
  const { id_cita } = req.params;
  const { nuevo_odontologo_id, motivo_cambio } = req.body;
  
  if (!nuevo_odontologo_id) {
    return res.status(400).json({ msg: 'Se requiere el ID del nuevo odontólogo.' });
  }

  try {
    // Verificar que la cita existe
    const [citaActual] = await db.query('SELECT * FROM citas WHERE id = ?', [id_cita]);
    if (!citaActual.length) {
      return res.status(404).json({ msg: 'Cita no encontrada.' });
    }

    const cita = citaActual[0];
    console.log('📅 Cita a reasignar:', cita);

    // Verificar que no está completada o cancelada
    if (cita.estado === 'completada' || cita.estado === 'cancelada') {
      return res.status(400).json({ msg: 'No se puede reasignar una cita completada o cancelada.' });
    }

    // Verificar que el nuevo odontólogo existe y está activo
    const [nuevoOdontologo] = await db.query(
      'SELECT * FROM usuarios WHERE id = ? AND rol = "odontologo" AND estado = "activo"',
      [nuevo_odontologo_id]
    );

    if (!nuevoOdontologo.length) {
      return res.status(400).json({ msg: 'El odontólogo seleccionado no existe o no está activo.' });
    }

    // Actualizar la cita
    let updateQuery = 'UPDATE citas SET odontologo_id = ?';
    let updateParams = [nuevo_odontologo_id];

    // Si hay motivo de cambio, agregarlo a las notas
    if (motivo_cambio) {
      const notasActuales = cita.notas || '';
      const nuevasNotas = notasActuales + 
        (notasActuales ? '\n' : '') + 
        `[${new Date().toLocaleString('es-ES')}] Reasignación: ${motivo_cambio}`;
      
      updateQuery += ', notas = ?';
      updateParams.push(nuevasNotas);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id_cita);

    console.log('⚡ Ejecutando reasignación:', updateQuery);
    await db.query(updateQuery, updateParams);

    console.log('✅ Odontólogo reasignado exitosamente');
    
    return res.json({ 
      success: true, 
      message: 'Odontólogo reasignado exitosamente',
      cita_id: id_cita,
      nuevo_odontologo: nuevoOdontologo[0]
    });

  } catch (err) {
    console.error('❌ Error en reasignarOdontologo:', err);
    return res.status(500).json({ msg: 'Error al reasignar odontólogo.', error: err.message });
  }
};
