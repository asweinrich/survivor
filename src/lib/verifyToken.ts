import crypto from 'crypto';

const SECRET = process.env.PHONE_VERIFY_SECRET || process.env.TWILIO_AUTH_TOKEN || '';
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

if (!SECRET) {
  console.warn('PHONE_VERIFY_SECRET is not set. Falling back to TWILIO_AUTH_TOKEN, but set a dedicated secret.');
}

// Issues a short-lived signed token proving `phone` was verified via Twilio
// just now. This lets us avoid re-checking the same OTP code twice
// (Twilio invalidates codes after one successful check).
export function issuePhoneVerificationToken(phone: string): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${phone}.${expires}`;
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

export function verifyPhoneVerificationToken(token: string, phone: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [tokenPhone, expiresStr, signature] = decoded.split('.');
    const expires = Number(expiresStr);

    if (tokenPhone !== phone) return false;
    if (!expires || Date.now() > expires) return false;

    const payload = `${tokenPhone}.${expiresStr}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}