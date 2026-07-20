"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";

export function AuthStep() {
  const { signUpWithEmail, signInWithEmail, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-sans text-2xl font-bold uppercase tracking-widest text-white mb-2">
          {isLogin ? "Sign In to Book" : "Create Account"}
        </h2>
        <p className="text-xs text-[#A1A1A1] tracking-wide">
          Please log in or sign up to schedule your photography session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider rounded uppercase">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 py-6"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
            Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 py-6"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300 disabled:opacity-50"
        >
          {submitting ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <div className="relative my-8 text-center">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
        <span className="relative bg-[#1A1A1A] px-4 text-[9px] uppercase font-bold tracking-widest text-[#A1A1A1]">
          Or Connect With
        </span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={submitting}
        aria-label="Sign in with Google Account"
        className="w-full flex items-center justify-center gap-3 border border-white/15 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-[0.2em] py-4 text-xs transition-colors duration-300 disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none"
      >
        <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Google Account
      </button>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1A1] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded outline-none"
        >
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}
