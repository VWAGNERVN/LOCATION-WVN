import crypto from "crypto";

function hmac(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}
function safeEqual(a,b) {
  const A=Buffer.from(a), B=Buffer.from(b);
  return A.length===B.length && crypto.timingSafeEqual(A,B);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, message:"Método no permitido." });

  const email = String(req.body?.email || "").trim().toLowerCase();
  const code = String(req.body?.code || "").trim();
  const challenge = String(req.body?.challenge || "");
  const secret = process.env.OTP_SECRET;

  if (!secret) return res.status(500).json({ ok:false, message:"Servidor no configurado." });
  if (!/^\d{6}$/.test(code) || !challenge) return res.status(400).json({ ok:false, message:"Datos de verificación inválidos." });

  try {
    const obj = JSON.parse(Buffer.from(challenge, "base64url").toString("utf8"));
    if (obj.email !== email) return res.status(400).json({ ok:false, message:"La verificación no corresponde a este correo." });
    if (!obj.exp || Date.now() > obj.exp) return res.status(400).json({ ok:false, message:"El código venció. Solicita uno nuevo." });

    const expected = hmac(secret, `${email}|${code}|${obj.exp}|${obj.nonce}`);
    if (!safeEqual(expected, obj.mac)) return res.status(400).json({ ok:false, message:"Código incorrecto." });

    // Token de verificación breve que podrá usarse al crear la cuenta en la siguiente etapa.
    const verifiedExp = Date.now() + 15 * 60 * 1000;
    const verifiedMac = hmac(secret, `verified|${email}|${verifiedExp}`);
    const verificationToken = Buffer.from(JSON.stringify({email,exp:verifiedExp,mac:verifiedMac})).toString("base64url");

    return res.status(200).json({ ok:true, message:"Correo verificado correctamente.", verificationToken });
  } catch {
    return res.status(400).json({ ok:false, message:"Solicitud de verificación inválida." });
  }
}
