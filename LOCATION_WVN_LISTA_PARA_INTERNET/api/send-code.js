import crypto from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hmac(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}
function b64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, message:"Método no permitido." });

  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ ok:false, message:"Introduce un correo válido." });
  }

  const { RESEND_API_KEY, MAIL_FROM, OTP_SECRET } = process.env;
  if (!RESEND_API_KEY || !MAIL_FROM || !OTP_SECRET) {
    return res.status(500).json({ ok:false, message:"El servicio de correo todavía no está configurado." });
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const exp = Date.now() + 10 * 60 * 1000;
  const nonce = crypto.randomBytes(16).toString("base64url");
  const mac = hmac(OTP_SECRET, `${email}|${code}|${exp}|${nonce}`);
  const challenge = b64({ email, exp, nonce, mac });

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#071321;padding:32px">
    <div style="max-width:520px;margin:auto;background:#0c1d31;border-radius:18px;padding:30px;color:#eef6ff">
      <h2 style="margin:0 0 8px">LOCATION WVN</h2>
      <p style="color:#a9bdd3">Código de verificación</p>
      <div style="font-size:36px;font-weight:800;letter-spacing:8px;padding:20px 0">${code}</div>
      <p>Este código vence en 10 minutos.</p>
      <p style="font-size:12px;color:#7f95ad">Si no solicitaste este código, ignora este correo.</p>
    </div>
  </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [email],
        subject: "Código de verificación — LOCATION WVN",
        html
      })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Resend:", data);
      return res.status(502).json({ ok:false, message:"No se pudo enviar el código. Revisa la configuración del remitente." });
    }

    return res.status(200).json({ ok:true, message:"Código enviado. Revisa tu correo.", challenge });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok:false, message:"Error al conectar con el servicio de correo." });
  }
}
