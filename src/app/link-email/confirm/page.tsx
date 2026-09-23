'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LinkEmailConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'transferring' | 'done' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [tribesTransferred, setTribesTransferred] = useState<number>(0);

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus('error');
        setMessage('Missing or invalid link.');
        return;
      }
      setStatus('transferring');
      try {
        const res = await fetch('/api/link-email/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to link tribes. Please contact Andrew');
        setTribesTransferred(data.tribesTransferred ?? 0);
        setStatus('done');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Something went wrong. Please contact Andrew');
      }
    }
    run();
  }, [token]);

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center font-lostIsland px-4 text-center">
      {status === 'verifying' || status === 'transferring' ? (
        <>
          <svg className="w-10 h-10 animate-spin text-stone-200 mb-4" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          </svg>
          <p className="text-lg lowercase tracking-wider">Linking your past tribes...</p>
        </>
      ) : status === 'done' ? (
        <>
          <div className="text-2xl uppercase mb-3">✓ Transfer Complete</div>
          <p className="lowercase tracking-wider mb-2">
            {tribesTransferred} tribe{tribesTransferred === 1 ? '' : 's'} linked to your phone account.
          </p>
          <p className="text-stone-400 lowercase tracking-wider text-sm">
            You can close this window and refresh your dashboard to see them.
          </p>
        </>
      ) : (
        <>
          <div className="text-2xl uppercase mb-3 text-red-400">Link Failed</div>
          <p className="lowercase tracking-wider text-stone-300">{message}</p>
        </>
      )}
    </div>
  );
}