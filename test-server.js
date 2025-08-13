const express = require('express');
const app = express();

console.log('🚀 Servidor de prueba iniciando...');

app.use(express.json());

// Log global
app.use((req, res, next) => {
  console.log(`🌍 REQUEST: ${req.method} ${req.url}`);
  next();
});

// Ruta de prueba
app.get('/test', (req, res) => {
  console.log('✅ Ruta /test ejecutada');
  res.json({ mensaje: 'Servidor de prueba funcionando' });
});

// Ruta específica que estaba probando
app.get('/api/usuarios/:id/pacientes', (req, res) => {
  console.log('✅ Ruta /api/usuarios/:id/pacientes ejecutada con ID:', req.params.id);
  res.json({ 
    mensaje: 'Función pacientes de prueba', 
    id: req.params.id,
    timestamp: new Date().toISOString()
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor de prueba corriendo en puerto ${PORT}`);
});
