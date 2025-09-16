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
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-start font-lostIsland px-4">
      <h1 className="text-2xl uppercase mt-8 mb-6">Sign in to Survivor Fantasy</h1>
      <div className="flex flex-col lowercase w-full mb-6 p-3 border-y-2 border-stone-700 text-stone-300 tracking-wider leading-tight">
        <span className="mb-3">Sign-in is optional!</span>
        <span className="mb-3">You do not need to sign-in to play the standard Survivor Fantasy format. (drafting a tribe of contestants)</span>
        <span className="mb-3">Sign-in is only required if you want to make weekly picks or view your player dashboard, where you can see your tribes from past fantasy seasons.</span>
        <span className="">Feel free to browse the site and play the normal way without signing in!</span>
      </div>

      <div className="w-full mt-2 text-center text-lg font-lostIsland lowercase tracking-wider leading-tight">No password needed!</div>
      <div className="w-full mt-2 text-center text-lg font-lostIsland lowercase tracking-wider leading-tight">Enter your email address to receive a one-time sign-in link</div>
      <div className="w-full mt-2 mb-2 text-center text-sm text-stone-300/80 font-lostIsland lowercase tracking-wider leading-tight">(This should be the same email address used for drafting your tribe)</div>
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 w-full p-3 text-2xl">
       
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="px-4 py-2 rounded text-black w-full"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white w-full lowercase"
        >
          Receive one-time link
        </button>
      </form>

      <div className="w-full p-4 text-center text-2xl font-lostIsland lowercase tracking-wider">or</div>

      {providers &&
        Object.values(providers).map((provider: any) =>
          provider.id === "email" ? null : (
            <div key={provider.name} className="mb-2 w-full p-4 text-2xl">
              <button
                onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
                className="px-5 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white w-full lowercase"
              >
                Sign in with {provider.name}
              </button>
            </div>
          )
        )}
    </div>
  );
}
