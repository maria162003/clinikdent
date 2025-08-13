const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

router.post('/', pagoController.registrarPago);
router.get('/paciente/:id', pagoController.pagosPorPaciente);

module.exports = router;
