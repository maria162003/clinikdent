const express = require('express');
const cors = require('cors');

// Importar rutas correctamente desde la carpeta Backend/routes
const authRoutes = require('./Backend/routes/authRoutes');
const citaRoutes = require('./Backend/routes/citaRoutes');
const tratamientoRoutes = require('./Backend/routes/tratamientoRoutes');

console.log('🔄 Cargando historialRoutes...');
const historialRoutes = require('./Backend/routes/historialRoutes');
console.log('✅ historialRoutes cargado exitosamente');

const notificacionRoutes = require('./Backend/routes/notificacionRoutes');
const faqRoutes = require('./Backend/routes/faqRoutes');
const pqrsRoutes = require('./Backend/routes/pqrsRoutes');
const pagoRoutes = require('./Backend/routes/pagoRoutes');
const chatRoutes = require('./Backend/routes/chatRoutes');
const contactoRoutes = require('./Backend/routes/contactoRoutes');
const usuarioRoutes = require('./Backend/routes/usuarioRoutes');

console.log('🔄 Cargando rutas de inventario...');
const inventarioRoutes = require('./Backend/routes/inventarioRoutes');
console.log('✅ Rutas de inventario cargadas');

console.log('🔄 Cargando rutas de sedes...');
const sedeRoutes = require('./Backend/routes/sedeRoutes');
console.log('✅ Rutas de sedes cargadas');

const app = express();

// Middlewares
app.use(cors());
// Log global para debug
app.use((req, res, next) => {
  console.log(`🌍 GLOBAL REQUEST: ${req.method} ${req.url}`);
  next();
});
// Soporta JSON
app.use(express.json());
// Soporta formularios <form method="POST">
app.use(express.urlencoded({ extended: true })); // <-- agrega esto

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/tratamientos', tratamientoRoutes);
console.log('🔗 Registrando rutas de historial...');
app.use('/api/historial', historialRoutes);
console.log('✅ Rutas de historial registradas exitosamente');
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/pqrs', pqrsRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/usuarios', usuarioRoutes);
console.log('🔗 Registrando rutas de inventario...');
app.use('/api/inventario', inventarioRoutes);
console.log('✅ Rutas de inventario registradas exitosamente');
console.log('🔗 Registrando rutas de sedes...');
app.use('/api/sedes', sedeRoutes);
console.log('✅ Rutas de sedes registradas exitosamente');

// Servir archivos estáticos del frontend
app.use(express.static('public'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('ERROR INTERNO:', err.stack);
  res.status(500).json({ msg: 'Error interno del servidor.' });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
});
