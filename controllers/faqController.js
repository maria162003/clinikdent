const db = require('../config/db');

exports.listarFaqs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM faqs ORDER BY orden ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: 'Error al listar FAQs.' });
  }
};

exports.crearFaq = async (req, res) => {
  const { pregunta, respuesta, orden } = req.body;
  if (!pregunta || !respuesta) return res.status(400).json({ msg: 'Datos incompletos.' });
  try {
    await db.query('INSERT INTO faqs (pregunta, respuesta, orden) VALUES (?, ?, ?)', [pregunta, respuesta, orden]);
    res.json({ msg: 'FAQ creada.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al crear FAQ.' });
  }
};
