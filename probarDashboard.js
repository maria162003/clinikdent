console.log('🧪 PROBANDO DASHBOARD CON DATOS REALES');
console.log('===================================');

// Simular navegador abriendo el dashboard
const baseUrl = 'http://localhost:3000';

// Probar acceso básico
async function probarAcceso() {
    try {
        console.log('1️⃣ Verificando que el servidor responda...');
        
        // Verificar que la página principal carga
        const response = await fetch(baseUrl);
        if (response.ok) {
            console.log('✅ Servidor respondiendo correctamente');
        } else {
            console.log('❌ Error en servidor:', response.status);
        }
        
        console.log('2️⃣ Verificando datos de usuario de prueba...');
        
        // Probar endpoint de perfil
        const perfilResponse = await fetch(`${baseUrl}/api/usuarios/6/perfil`);
        if (perfilResponse.ok) {
            const perfil = await perfilResponse.json();
            console.log('✅ Perfil obtenido:', perfil);
        } else {
            console.log('❌ Error obteniendo perfil:', perfilResponse.status);
        }
        
        console.log('3️⃣ Verificando citas del usuario...');
        
        // Probar endpoint de citas
        const citasResponse = await fetch(`${baseUrl}/api/citas/6`);
        if (citasResponse.ok) {
            const citas = await citasResponse.json();
            console.log('✅ Citas obtenidas:', citas.length, 'citas encontradas');
            if (citas.length > 0) {
                console.log('📋 Primera cita:', citas[0]);
            }
        } else {
            console.log('❌ Error obteniendo citas:', citasResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error en pruebas:', error.message);
    }
}

// Usar import dinámico para fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

probarAcceso();
