// Simulación de prueba del sistema de perfil
async function probarSistemaPerfil() {
    console.log('🧪 PRUEBA DEL SISTEMA DE PERFIL');
    console.log('================================');
    
    try {
        // Usuario de prueba (paciente)
        const userId = 6; // Juan Gómez
        
        console.log(`\n1️⃣ Obteniendo perfil del usuario ID: ${userId}`);
        
        // Simular la llamada usando el mismo código que el frontend
        const baseUrl = 'http://localhost:3000';
        
        // Probar con una simple verificación
        console.log('� Probando conectividad al servidor...');
        
        const testResponse = await fetch(`${baseUrl}/api/usuarios/${userId}/perfil`);
        console.log('📡 Respuesta del servidor:', testResponse.status, testResponse.statusText);
        
        if (testResponse.ok) {
            const perfil = await testResponse.json();
            console.log('✅ Perfil obtenido:', perfil);
        } else {
            const error = await testResponse.text();
            console.log('❌ Error:', error);
        }
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
}

// Usar require para importar
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

probarSistemaPerfil();
