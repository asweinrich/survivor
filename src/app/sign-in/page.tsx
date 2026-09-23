'use client';

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function SignInPage() {
  const [showDetails, setShowDetails] = useState(false);

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [codeSentMessage, setCodeSentMessage] = useState(false);

  useEffect(() => {
    async function checkSignIn() {
      const session = await getSession();
      if (session) redirect("/dashboard");
    }
    checkSignIn();
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/phone/sign-in/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No account found for that phone number.");
      }
      setOtpSent(true);
      setCodeSentMessage(true);
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyAndSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const verifyRes = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) throw new Error(verifyData?.message || "Invalid code");

      const result = await signIn("phone", {
        phone: verifyData.phone,
        verificationToken: verifyData.verificationToken,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) throw new Error("Sign-in failed. Please try again. If issues persist, please contact Andrew in WhatsApp");
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-start font-lostIsland px-4">
      <h1 className="text-2xl uppercase mt-8 mb-6">Sign in to Survivor Fantasy</h1>

      <div className="flex flex-col lowercase w-full mb-6 p-3 border-y-2 border-stone-700 text-stone-300 tracking-wider leading-tight">
        <button
          type="button"
          onClick={() => setShowDetails((open) => !open)}
          className="flex items-center justify-between w-full focus:outline-none"
          aria-expanded={showDetails}
          aria-controls="sign-in-help-details"
        >
          <span className="mb-0">Sign-in is optional!</span>
          <svg
            className={`w-5 h-5 ml-2 transition-transform ${showDetails ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDetails && (
          <div className="flex flex-col mt-3">
            <span className="mb-3">You must have drafted a fantasy tribe to sign in. Sign-in is keyed to the phone number you drafted with.</span>
            <span className="mb-3">Sign-in is only required if you want to make weekly pick ems or view your player dashboard.</span>
            <span className="">Feel free to browse the site without signing in.</span>
          </div>
        )}
      </div>

      {!otpSent ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-3 w-full p-3 text-2xl">
          <div className="w-full text-center text-lg lowercase tracking-wider leading-tight mb-6">
            Enter your phone number to sign in.
          </div>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            className="px-4 py-2 rounded text-black w-full"
          />
          <button
            type="submit"
            disabled={sending}
            className={`w-full py-2 rounded text-lg uppercase font-lostIsland tracking-wider ${
              sending
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {sending ? "Sending..." : "Send sign-in code"}
          </button>

          {error && (
            <div className="mt-2 p-2 rounded border border-red-700 bg-red-900/30 text-red-200 text-base lowercase leading-tight text-center">
              {error}
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleVerifyAndSignIn} className="flex flex-col gap-3 w-full p-3 text-2xl">
          <div className="w-full text-center text-lg lowercase tracking-wider leading-tight">
            Enter the 6-digit code we texted you
          </div>

          {codeSentMessage && !error && (
            <div className="p-2 rounded border font-lostIsland border-green-700 bg-green-900/30 text-green-200 text-center tracking-wider lowercase">
              ✓ Code sent
            </div>
          )}

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            placeholder="6-digit code"
            className="px-4 py-2 rounded text-black font-lostIsland w-full text-center text-xl tracking-widest lowercase"
          />
          <button
            type="submit"
            disabled={verifying || otpCode.length !== 6}
            className={`w-full py-2 rounded text-lg uppercase font-lostIsland tracking-wider ${
              verifying || otpCode.length !== 6
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {verifying ? "Verifying..." : "Sign in"}
          </button>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending}
            className="text-xs text-orange-400 hover:text-orange-300 tracking-wider underline"
          >
            {sending ? "Resending..." : "Didn't get it? Resend code"}
          </button>

          {error && (
            <div className="mt-2 p-2 rounded border border-red-700 bg-red-900/30 text-red-200 text-sm text-center">
              {error}
            </div>
          )}
        </form>
      )}

      <div className="w-full mt-6 border-t border-stone-700 pt-4 text-center text-sm text-stone-400 lowercase tracking-wider leading-tight">
        Played Survivor Fantasy before with an email address? You won't see those past tribes when you sign in. But don't worry! You can link your past tribes to your Season 51 account after drafting your Season 51 tribe. Look for the option on your dashboard.
      </div>
    </div>
  );
}