// Controlador simplificado para planes de tratamiento

console.log('🔄 Cargando planesController...');

const obtenerPlanesTratamientoOdontologo = (req, res) => {
    console.log('📋 Función obtenerPlanesTratamientoOdontologo ejecutada');
    res.json({
        success: true,
        planes: [
            {
                id: 1,
                paciente_nombre: 'Juan Pérez',
                nombre_tratamiento: 'Ortodoncia completa',
                estado: 'en_progreso',
                progreso: 35
            }
        ]
    });
};

const crearPlanTratamiento = (req, res) => {
    console.log('➕ Función crearPlanTratamiento ejecutada');
    res.json({
        success: true,
        message: 'Plan creado',
        planId: Date.now()
    });
};

const actualizarPlanTratamiento = (req, res) => {
    console.log('📝 Función actualizarPlanTratamiento ejecutada');
    res.json({
        success: true,
        message: 'Plan actualizado'
    });
};

const obtenerPlanesTratamientoPaciente = (req, res) => {
    console.log('👤 Función obtenerPlanesTratamientoPaciente ejecutada');
    res.json({
        success: true,
        planes: []
    });
};

const actualizarProgreso = (req, res) => {
    console.log('📊 Función actualizarProgreso ejecutada');
    res.json({
        success: true,
        message: 'Progreso actualizado'
    });
};

const eliminarPlanTratamiento = (req, res) => {
    console.log('🗑️ Función eliminarPlanTratamiento ejecutada');
    res.json({
        success: true,
        message: 'Plan eliminado'
    });
};

const obtenerSesionesPlan = (req, res) => {
    console.log('📅 Función obtenerSesionesPlan ejecutada');
    res.json({
        success: true,
        sesiones: []
    });
};

const actualizarSesion = (req, res) => {
    console.log('🔄 Función actualizarSesion ejecutada');
    res.json({
        success: true,
        message: 'Sesión actualizada'
    });
};

console.log('✅ planesController cargado exitosamente');

module.exports = {
    obtenerPlanesTratamientoOdontologo,
    crearPlanTratamiento,
    actualizarPlanTratamiento,
    obtenerPlanesTratamientoPaciente,
    actualizarProgreso,
    eliminarPlanTratamiento,
    obtenerSesionesPlan,
    actualizarSesion
};
