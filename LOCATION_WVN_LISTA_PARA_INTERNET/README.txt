LOCATION WVN — LISTO PARA PUBLICAR EN VERCEL
================================================

ESTE PROYECTO NO SE ABRE HACIENDO DOBLE CLIC EN index.html.
Debe publicarse en Vercel para que /api/send-code y /api/verify-code funcionen.

VARIABLES DE ENTORNO OBLIGATORIAS EN VERCEL:
1) RESEND_API_KEY
   Tu clave API de Resend.

2) MAIL_FROM
   Ejemplo:
   LOCATION WVN <noreply@tudominio.com>

3) OTP_SECRET
   Una cadena larga y aleatoria, por ejemplo de 64 caracteres.

PUBLICACIÓN:
1) Crea una cuenta en Vercel.
2) Sube/importa esta carpeta como proyecto.
3) En Settings > Environment Variables agrega las 3 variables anteriores.
4) Deploy.
5) Vercel te dará una dirección pública https://....vercel.app

CORREO:
Debes verificar tu dominio/remitente en Resend para enviar a cualquier correo.
La API key nunca debe ponerse dentro del HTML.

GOOGLE:
Tener una URL pública no significa aparecer inmediatamente en Google.
Para ello conviene conectar un dominio propio y darlo de alta en Google Search Console.

SEGURIDAD:
- El OTP vence en 10 minutos.
- El código nunca se devuelve al navegador.
- La verificación se firma en servidor.
- Para una versión comercial, conviene añadir rate limiting persistente, CAPTCHA/Turnstile,
  base de datos, sesiones y registro definitivo de usuarios.
