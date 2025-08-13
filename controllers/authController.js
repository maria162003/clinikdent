// Backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../services/emailService');

/**
 * POST /api/auth/register
 * body: { nombre, apellido, tipo_documento, numero_documento, correo, password,
 *         telefono, direccion, fecha_nacimiento, acepta_politica, rol?, avatar_url? }
 * Nota: roles válidos en BD: 'paciente','odontologo','admin'
 */
exports.registerUser = async (req, res) => {
  const {
    nombre, apellido, tipo_documento, numero_documento, correo, password,
    telefono, direccion, fecha_nacimiento, acepta_politica, rol, avatar_url
  } = req.body;

  if (!nombre || !apellido || !tipo_documento || !numero_documento || !correo ||
      !password || !telefono || !direccion || !fecha_nacimiento) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
  }
  if (!acepta_politica) {
    return res.status(400).json({ msg: 'Debe aceptar la política de privacidad.' });
  }

  try {
    // Unicidad (id existe y es PK) 
    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ? OR numero_documento = ?',
      [correo, numero_documento]
    );
    if (existe.length) {
      return res.status(400).json({ msg: 'El correo o documento ya está registrado.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Normalizar rol recibido a enum real de BD ('admin' en vez de 'administrador') 
    const normalizaRol = (r) => {
      if (!r) return 'paciente';
      const map = { administrador: 'admin', admin: 'admin', paciente: 'paciente', odontologo: 'odontologo' };
      return map[r.toLowerCase()] || 'paciente';
    };
    const rolFinal = normalizaRol(rol);

    // Insert ajustado a columnas REALES (no existe whatsapp; avatar_url es opcional) 
    const [result] = await db.query(
      `INSERT INTO usuarios
        (rol, nombre, apellido, tipo_documento, numero_documento, correo, contraseña_hash,
         telefono, direccion, fecha_nacimiento, avatar_url, estado)
       VALUES (?,?,?,?,?,?,?,?,?,?,?, 'activo')`,
      [rolFinal, nombre, apellido, tipo_documento, numero_documento, correo, hashed,
       telefono, direccion, fecha_nacimiento, avatar_url || null]
    );

    return res.json({ msg: 'Registro exitoso.', id: result.insertId, rol: rolFinal });
  } catch (err) {
    console.error('registerUser:', err);
    return res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * POST /api/auth/login
 * body: { correo, password, rol }
 */
exports.loginUser = async (req, res) => {
  const { correo, password, rol } = req.body;
  if (!correo || !password || !rol) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
  }

  // normaliza rol al enum real de la BD
  const mapRol = { administrador: 'admin', admin: 'admin', paciente: 'paciente', odontologo: 'odontologo' };
  const rolEsperado = mapRol[String(rol).toLowerCase()] || 'paciente';

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (!rows.length) return res.status(400).json({ msg: 'Usuario no encontrado.' });

    const u = rows[0];
    if (u.rol !== rolEsperado) return res.status(403).json({ msg: 'Rol incorrecto.' });

    const pass = String(password).trim();
    const hash = u['contraseña_hash']; // usa bracket notation por la ñ

    let ok = false;

    if (hash && hash.startsWith('$2')) {
      // caso normal: ya es bcrypt
      ok = await bcrypt.compare(pass, hash);
    } else {
      // legado: guardado en texto plano
      ok = pass === (hash || '');
      if (ok) {
        // migra a bcrypt para futuras veces
        const newHash = await bcrypt.hash(pass, 10);
        await db.query('UPDATE usuarios SET `contraseña_hash` = ? WHERE id = ?', [newHash, u.id]);
      }
    }

    if (!ok) return res.status(400).json({ msg: 'Contraseña incorrecta.' });

    return res.json({ 
      msg: 'Login exitoso', 
      rol: u.rol, 
      id: u.id, 
      nombre: u.nombre,
      apellido: u.apellido 
    });
  } catch (err) {
    console.error('loginUser:', err);
    return res.status(500).json({ msg: 'Error en el servidor.' });
  }
};


/**
 * POST /api/auth/recuperar
 * body: { correo, numero_documento }
 */
exports.recuperarPassword = async (req, res) => {
  const { correo, numero_documento } = req.body;
  if (!correo || !numero_documento) {
    return res.status(400).json({ msg: 'Debe ingresar correo y documento.' });
  }
  
  try {
    // Verificar que el usuario existe
    const [rows] = await db.query(
      'SELECT id, nombre, apellido FROM usuarios WHERE correo = ? AND numero_documento = ?',
      [correo, numero_documento]
    );
    
    if (!rows.length) {
      return res.status(400).json({ msg: 'Los datos ingresados no coinciden con ninguna cuenta.' });
    }
    
    const usuario = rows[0];
    
    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora
    
    // Limpiar tokens antiguos del usuario
    await db.query(
      'DELETE FROM password_reset_tokens WHERE usuario_id = ? OR expires_at < NOW()',
      [usuario.id]
    );
    
    // Guardar nuevo token
    await db.query(
      'INSERT INTO password_reset_tokens (usuario_id, token, expires_at) VALUES (?, ?, ?)',
      [usuario.id, resetToken, expiresAt]
    );
    
    // Enviar email
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
    const emailResult = await emailService.sendPasswordResetEmail(correo, resetToken, nombreCompleto);
    
    if (emailResult.success) {
      console.log(`✅ Token de recuperación generado para usuario ${usuario.id}: ${resetToken.substring(0, 10)}...`);
      return res.json({ 
        msg: 'Se enviaron las instrucciones de recuperación a tu correo electrónico.',
        debug: process.env.NODE_ENV === 'development' ? { token: resetToken } : undefined
      });
    } else {
      // Si falla el email, eliminar el token
      await db.query('DELETE FROM password_reset_tokens WHERE token = ?', [resetToken]);
      return res.status(500).json({ msg: 'Error enviando el correo. Intenta nuevamente.' });
    }
    
  } catch (err) {
    console.error('recuperarPassword:', err);
    return res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * POST /api/auth/reset-password
 * body: { token, new_password }
 */
exports.resetPassword = async (req, res) => {
  const { token, new_password } = req.body;
  
  if (!token || !new_password) {
    return res.status(400).json({ msg: 'Token y nueva contraseña son requeridos.' });
  }
  
  if (new_password.length < 6) {
    return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres.' });
  }
  
  try {
    // Verificar token
    const [tokenRows] = await db.query(
      `SELECT rt.*, u.correo, u.nombre, u.apellido 
       FROM password_reset_tokens rt 
       JOIN usuarios u ON rt.usuario_id = u.id 
       WHERE rt.token = ? AND rt.expires_at > NOW() AND rt.used = FALSE`,
      [token]
    );
    
    if (!tokenRows.length) {
      return res.status(400).json({ msg: 'Token inválido o expirado.' });
    }
    
    const tokenData = tokenRows[0];
    
    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Actualizar contraseña
    await db.query(
      'UPDATE usuarios SET contraseña_hash = ? WHERE id = ?',
      [hashedPassword, tokenData.usuario_id]
    );
    
    // Marcar token como usado
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
      [token]
    );
    
    console.log(`✅ Contraseña actualizada para usuario ${tokenData.usuario_id}`);
    
    return res.json({ 
      msg: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      user: `${tokenData.nombre} ${tokenData.apellido}`
    });
    
  } catch (err) {
    console.error('resetPassword:', err);
    return res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * GET /api/auth/verify-token/:token
 * Verificar si un token es válido
 */
exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;
  
  try {
    const [rows] = await db.query(
      `SELECT rt.*, u.nombre, u.apellido, u.correo 
       FROM password_reset_tokens rt 
       JOIN usuarios u ON rt.usuario_id = u.id 
       WHERE rt.token = ? AND rt.expires_at > NOW() AND rt.used = FALSE`,
      [token]
    );
    
    if (!rows.length) {
      return res.status(400).json({ valid: false, msg: 'Token inválido o expirado.' });
    }
    
    const tokenData = rows[0];
    const timeLeft = Math.floor((new Date(tokenData.expires_at) - new Date()) / 1000 / 60); // minutos restantes
    
    return res.json({ 
      valid: true, 
      user: `${tokenData.nombre} ${tokenData.apellido}`,
      email: tokenData.correo,
      expires_in_minutes: timeLeft
    });
    
  } catch (err) {
    console.error('verifyResetToken:', err);
    return res.status(500).json({ msg: 'Error en el servidor.' });
  }
};
