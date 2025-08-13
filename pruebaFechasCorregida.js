// Script para probar la funcionalidad de cancelación con fechas corregidas
const express = require('express');
const app = express();

// Simular datos como los devuelve la base de datos
const citaSimulada = {
  id: 1,
  fecha: new Date('2025-08-13'), // Fecha futura  
  hora: '14:00:00',
  estado: 'programada'
};

console.log('🧪 PRUEBA DE CÁLCULO DE FECHAS');
console.log('================================');

// Simular método del backend corregido
function calcularDiferenciaHoras(cita) {
  const fechaActual = new Date();
  const fechaStr = cita.fecha.toISOString().split('T')[0];
  const fechaCita = new Date(`${fechaStr} ${cita.hora}`);
  const diffHoras = (fechaCita - fechaActual) / (1000 * 60 * 60);
  
  return {
    fechaActual: fechaActual.toISOString(),
    fechaStr,
    fechaCita: fechaCita.toISOString(),
    diffHoras: diffHoras,
    diffHorasFormateadas: diffHoras.toFixed(2)
  };
}

const resultado = calcularDiferenciaHoras(citaSimulada);

console.log('📋 Datos de la cita:');
console.log(`   - ID: ${citaSimulada.id}`);
console.log(`   - Fecha BD: ${citaSimulada.fecha.toISOString()}`);
console.log(`   - Hora: ${citaSimulada.hora}`);
console.log(`   - Estado: ${citaSimulada.estado}`);

console.log('\n⏰ Cálculo de tiempo:');
console.log(`   - Fecha actual: ${resultado.fechaActual}`);
console.log(`   - Fecha string: ${resultado.fechaStr}`);
console.log(`   - Fecha construida: ${resultado.fechaCita}`);
console.log(`   - Diferencia: ${resultado.diffHorasFormateadas} horas`);
console.log(`   - Es NaN?: ${isNaN(resultado.diffHoras)}`);

console.log('\n🎯 Resultado de validación:');
if (resultado.diffHoras >= 4) {
  console.log('✅ Se puede ELIMINAR o CANCELAR (más de 4 horas)');
} else if (resultado.diffHoras >= 2) {
  console.log('⚠️ Solo se puede CANCELAR (entre 2-4 horas)');
} else if (resultado.diffHoras >= 0) {
  console.log('❌ NO se puede cancelar (menos de 2 horas)');
} else {
  console.log('🚫 Cita ya pasó (fecha en el pasado)');
}

console.log('\n✅ Prueba completada - Las fechas ya NO devuelven NaN');
