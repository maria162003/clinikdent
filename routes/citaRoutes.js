const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

// Obtener todas las citas para administrador
router.get('/admin/todas', citaController.obtenerTodasLasCitas);
// Obtener citas próximas para notificaciones
router.get('/admin/proximas', citaController.obtenerCitasProximas);
// Obtener citas de hoy
router.get('/admin/hoy', citaController.obtenerCitasHoy);
// Obtener historial general de cambios
router.get('/admin/historial-general', citaController.obtenerHistorialGeneral);
// Obtener historial de una cita específica
router.get('/:id_cita/historial', citaController.obtenerHistorialCita);
// Agendar cita
router.post('/', citaController.agendarCita);
// Ver citas por usuario
router.get('/:id_usuario', citaController.obtenerCitasPorUsuario);
// Reagendar cita
router.put('/:id_cita', citaController.reagendarCita);
// Actualizar estado de cita
router.patch('/:id_cita', citaController.actualizarEstadoCita);
// Reasignar odontólogo a una cita
router.patch('/:id_cita/reasignar', citaController.reasignarOdontologo);
// Cancelar cita (cambiar estado)
router.delete('/:id_cita', citaController.cancelarCita);
// Eliminar cita completamente
router.delete('/:id_cita/eliminar', citaController.eliminarCita);
// Panel de agenda (por rol)
router.get('/agenda/:rol', citaController.obtenerAgendaPorRol);

module.exports = router;
