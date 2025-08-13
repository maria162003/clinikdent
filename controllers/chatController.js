const db = require('../config/db');

exports.enviarMensaje = async (req, res) => {
  const { remitente_id, destinatario_id, mensaje } = req.body;
  if (!remitente_id || !destinatario_id || !mensaje) return res.status(400).json({ msg: 'Datos incompletos.' });
  try {
    await db.query('INSERT INTO chat_soporte (remitente_id, destinatario_id, mensaje, fecha_envio) VALUES (?, ?, ?, NOW())', [remitente_id, destinatario_id, mensaje]);
    res.json({ msg: 'Mensaje enviado.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al enviar mensaje.' });
  }
};

exports.obtenerConversacion = async (req, res) => {
  const { remitente_id, destinatario_id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM chat_soporte WHERE (remitente_id = ? AND destinatario_id = ?) OR (remitente_id = ? AND destinatario_id = ?) ORDER BY fecha_envio ASC', [remitente_id, destinatario_id, destinatario_id, remitente_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener conversación.' });
  }
};
