// Middleware básico para obtener el usuario del localStorage enviado desde el frontend
const authMiddleware = (req, res, next) => {
    // Por ahora, vamos a obtener el userId desde el header o body
    const userId = req.headers['user-id'] || req.body.userId || req.query.userId;
    
    console.log('🔐 AuthMiddleware - Headers recibidos:', req.headers);
    console.log('🔐 AuthMiddleware - userId extraído:', userId);
    
    if (!userId) {
        console.log('❌ AuthMiddleware - No se encontró userId');
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    
    // Agregamos el usuario a la request
    req.user = { id: parseInt(userId) };
    console.log('✅ AuthMiddleware - Usuario configurado:', req.user);
    next();
};

module.exports = authMiddleware;
