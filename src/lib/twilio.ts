import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !verifyServiceSid) {
  console.warn(
    'Twilio env vars are missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in your .env file.'
  );
}

export const twilioClient = twilio(accountSid, authToken);
export const verifyServiceSidValue = verifyServiceSid as string;

// Normalize a US phone number to E.164 format (+1XXXXXXXXXX).
// Twilio Verify requires E.164, and consistent formatting matters
// so Player.phone lookups always match.
export function toE164(rawPhone: string): string | null {
  if (!rawPhone) return null;

  const digits = rawPhone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Already looks like it has a country code and a leading +
  if (rawPhone.startsWith('+')) {
    return rawPhone;
  }

  return null;
}

// Sends a plain SMS (not a Verify code) from your Twilio number.
// Used for things like draft confirmations, not OTP codes.
export async function sendSms(to: string, body: string) {
  if (!fromPhoneNumber) {
    console.warn('TWILIO_PHONE_NUMBER is not set. Skipping SMS send.');
    return null;
  }

  try {
    return await twilioClient.messages.create({
      to,
      from: fromPhoneNumber,
      body,
    });
  } catch (error) {
    // Don't let a failed confirmation text break the draft submission itself.
    console.error('Failed to send confirmation SMS:', error);
    return null;
  }
}