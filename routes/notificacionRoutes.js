const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');

router.get('/:usuario_id', notificacionController.obtenerNotificacionesPorUsuario);
router.post('/', notificacionController.crearNotificacion);

module.exports = router;
