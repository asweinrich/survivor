'use client';

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { getSession } from "next-auth/react";



export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkSignIn() {
      const session = await getSession();
      if (session) {
        redirect("/dashboard");
      }
      getProviders().then(setProviders);
    }
    
    checkSignIn();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("email", { email });
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center font-lostIsland">
      <h1 className="text-3xl mb-6">Sign in to Survivor Fantasy</h1>

      <form onSubmit={handleEmailLogin} className="mb-6 flex flex-col gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="px-4 py-2 rounded text-black"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          Sign in with Email
        </button>
      </form>

      {providers &&
        Object.values(providers).map((provider: any) =>
          provider.id === "email" ? null : (
            <div key={provider.name} className="mb-2">
              <button
                onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
                className="px-5 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white"
              >
                Sign in with {provider.name}
              </button>
            </div>
          )
        )}
    </div>
  );
}
