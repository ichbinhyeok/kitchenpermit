"use client";

import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getSafeNextPath } from "@/lib/auth/redirects";

type AuthMode = "login" | "signup";

function statusMessage(value: string | null, signedOut: string | null) {
  if (signedOut) {
    return "Signed out. Use Google or email/password to return to the company dashboard.";
  }

  if (value === "google-missing") {
    return "Google OAuth is not configured on the Spring server yet.";
  }

  if (value === "failed") {
    return "Email or password did not match.";
  }

  if (value === "exists") {
    return "An account already exists for that email. Log in instead.";
  }

  if (value === "password-mismatch") {
    return "Password confirmation did not match.";
  }

  if (value === "weak-password") {
    return "Use a password with at least 8 characters.";
  }

  return null;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams],
  );
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const message =
    clientMessage ?? statusMessage(searchParams.get("auth"), searchParams.get("signed_out"));
  const isSignup = mode === "signup";

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    if (password !== confirmPassword) {
      event.preventDefault();
      setClientMessage("Password confirmation did not match.");
      return;
    }

    if (password.length < 8) {
      event.preventDefault();
      setClientMessage("Use a password with at least 8 characters.");
    }
  }

  return (
    <div className="grid gap-5">
      <a
        href={`/auth/google?next=${encodeURIComponent(nextPath)}`}
        className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 text-sm font-black uppercase tracking-[0.12em] text-[#111315] shadow-[0_16px_45px_rgba(26,20,16,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
      >
        Continue with Google
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </a>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#8a7b6d]">
        <span className="h-px bg-black/10" />
        or use email
        <span className="h-px bg-black/10" />
      </div>

      <div className="grid grid-cols-2 rounded-full border border-black/10 bg-white p-1">
        {(["login", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setClientMessage(null);
            }}
            className={`min-h-11 rounded-full text-xs font-black uppercase tracking-[0.13em] transition ${
              mode === item
                ? "bg-[#111315] text-white"
                : "text-[#75695f] hover:bg-[#fbf7ef] hover:text-[#111315]"
            }`}
          >
            {item === "login" ? "Log in" : "Create account"}
          </button>
        ))}
      </div>

      <form
        action={isSignup ? "/auth/signup" : "/auth/login"}
        method="post"
        onSubmit={isSignup ? handleSignupSubmit : undefined}
        className="grid gap-3"
      >
        <input type="hidden" name="next" value={nextPath} />
        <label className="grid gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7b6f65]">
            Work email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="owner@yourcompany.com"
            className="min-h-14 rounded-[22px] border border-black/10 bg-white px-4 text-base font-bold text-[#111315] outline-none transition placeholder:text-[#b2a69b] focus:border-[#f26a21] focus:ring-4 focus:ring-[#f26a21]/15"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7b6f65]">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setClientMessage(null);
            }}
            className="min-h-14 rounded-[22px] border border-black/10 bg-white px-4 text-base font-bold text-[#111315] outline-none transition placeholder:text-[#b2a69b] focus:border-[#f26a21] focus:ring-4 focus:ring-[#f26a21]/15"
          />
        </label>
        {isSignup ? (
          <label className="grid gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7b6f65]">
              Confirm password
            </span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setClientMessage(null);
              }}
              className="min-h-14 rounded-[22px] border border-black/10 bg-white px-4 text-base font-bold text-[#111315] outline-none transition placeholder:text-[#b2a69b] focus:border-[#f26a21] focus:ring-4 focus:ring-[#f26a21]/15"
            />
          </label>
        ) : null}
        <button
          type="submit"
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#dd5b17]"
        >
          {isSignup ? "Create account" : "Log in"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {message ? (
        <div className="rounded-[22px] border border-black/10 bg-white/72 p-4 text-sm font-semibold leading-6 text-[#5f574f]">
          {message}
        </div>
      ) : null}

      <div className="rounded-[24px] bg-[#111315] p-4 text-sm leading-6 text-white/70">
        <p className="font-black text-white">Account manages company output</p>
        <p className="mt-1">
          Free builder stays open. Sign in to manage the company version; active
          subscription access unlocks saved company details, clean PDFs, live
          service report links, and dashboard history.
        </p>
      </div>
    </div>
  );
}
