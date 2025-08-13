const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/enviar', chatController.enviarMensaje);
router.get('/conversacion/:remitente_id/:destinatario_id', chatController.obtenerConversacion);

module.exports = router;
