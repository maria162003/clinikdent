
const pool = require('../config/db');

// POST /pagos
exports.registrarPago = async (req, res) => {
  const { cita_id, paciente_id, monto, metodo, estado, referencia_transaccion } = req.body;
  if (!cita_id || !paciente_id || monto == null || !metodo || !estado) {
    return res.status(400).json({ msg: 'Datos incompletos.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[cita]] = await conn.query(
      'SELECT id, paciente_id AS pacienteId FROM citas WHERE id = ?',
      [cita_id]
    );
    if (!cita) { await conn.rollback(); return res.status(404).json({ msg: 'La cita no existe.' }); }
    if (Number(cita.pacienteId) !== Number(paciente_id)) {
      await conn.rollback(); return res.status(400).json({ msg: 'La cita no corresponde al paciente indicado.' });
    }
    const [result] = await conn.execute(
      `INSERT INTO pagos
        (cita_id, paciente_id, monto, metodo, estado, fecha_pago, referencia_transaccion)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [cita_id, paciente_id, Number(monto), metodo, estado, referencia_transaccion || null]
    );
    await conn.commit();
    return res.status(201).json({ msg: 'Pago registrado.', id: result.insertId });
  } catch (err) {
    console.error('Error registrarPago:', err);
    await conn.rollback();
    return res.status(500).json({ msg: 'Error al registrar pago.' });
  } finally {
    conn.release();
  }
};

// GET /pagos/paciente/:id?page=&limit=
exports.pagosPorPaciente = async (req, res) => {
  const { id } = req.params;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.fecha AS cita_fecha, c.hora AS cita_hora, c.estado AS cita_estado
         FROM pagos p
         JOIN citas c ON c.id = p.cita_id
        WHERE p.paciente_id = ?
        ORDER BY p.fecha_pago DESC, p.id DESC
        LIMIT ? OFFSET ?`,
      [id, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM pagos WHERE paciente_id = ?',
      [id]
    );
    return res.json({ data: rows, page, limit, total });
  } catch (err) {
    console.error('Error pagosPorPaciente:', err);
    return res.status(500).json({ msg: 'Error al obtener pagos.' });
  }
};
