// Backend/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configuración para Gmail (gratuito)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'clinikdent.test@gmail.com', // Email de prueba
        pass: process.env.EMAIL_PASS || 'app_password_here' // App password de Gmail
      }
    });
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'Clinik Dent',
        address: process.env.EMAIL_USER || 'clinikdent.test@gmail.com'
      },
      to: email,
      subject: 'Recuperación de Contraseña - Clinik Dent',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0077b6, #00a3e1); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #0077b6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦷 Clinik Dent</h1>
              <h2>Recuperación de Contraseña</h2>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Clinik Dent.</p>
              
              <p>Si solicitaste este cambio, haz clic en el siguiente botón para crear una nueva contraseña:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este enlace es válido por <strong>1 hora</strong></li>
                  <li>Solo puedes usarlo <strong>una vez</strong></li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
              </div>
              
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>Saludos cordiales,<br>
              <strong>Equipo de Clinik Dent</strong></p>
            </div>
            <div class="footer">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <p>© 2025 Clinik Dent. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de recuperación enviado a: ${email}`);
      return { success: true, message: 'Email enviado correctamente' };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return { success: false, message: 'Error enviando email', error };
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Servidor de email listo');
      return true;
    } catch (error) {
      console.error('❌ Error conectando con servidor de email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
