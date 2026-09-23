import crypto from 'crypto';

const SECRET = process.env.EMAIL_LINK_SECRET || process.env.PHONE_VERIFY_SECRET || '';
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

if (!SECRET) {
  console.warn('EMAIL_LINK_SECRET is not set. Set a dedicated secret in .env.');
}

type LinkPayload = {
  email: string;
  targetPlayerId: number; // the phone-based Player.id to transfer tribes into
};

// Issues a short-lived signed token proving the user requested to link
// `email`'s old tribes into the `targetPlayerId` (phone) account.
export function issueEmailLinkToken(payload: LinkPayload): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const body = JSON.stringify({ ...payload, expires });
  const encoded = Buffer.from(body).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(encoded).digest('hex');
  return `${encoded}.${signature}`;
}

export function verifyEmailLinkToken(token: string): (LinkPayload & { expires: number }) | null {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', SECRET).update(encoded).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!decoded?.expires || Date.now() > decoded.expires) return null;
    if (!decoded?.email || !decoded?.targetPlayerId) return null;

    return decoded;
  } catch {
    return null;
  }
}