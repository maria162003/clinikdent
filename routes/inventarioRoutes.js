const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

console.log('🔄 Cargando rutas de inventario...');

// Rutas principales
router.get('/', inventarioController.obtenerInventario);
router.post('/', inventarioController.agregarItemInventario);
router.put('/:id', inventarioController.actualizarItemInventario);
router.delete('/:id', inventarioController.eliminarItemInventario);

// Rutas específicas
router.get('/sede/:sede_id', inventarioController.obtenerInventarioPorSede);
router.get('/equipos', inventarioController.obtenerEquipos);
router.get('/estadisticas', inventarioController.obtenerEstadisticasInventario);

// Mantener compatibilidad con rutas anteriores
router.get('/movimientos/:inventarioId', inventarioController.obtenerMovimientos || ((req, res) => res.json([])));
router.get('/reporte', inventarioController.obtenerReporteInventario || inventarioController.obtenerEstadisticasInventario);
router.post('/elemento', inventarioController.crearElemento);
router.put('/elemento/:id', inventarioController.actualizarElemento);
router.delete('/elemento/:id', inventarioController.eliminarElemento);

console.log('✅ Rutas de inventario cargadas exitosamente');

module.exports = router;