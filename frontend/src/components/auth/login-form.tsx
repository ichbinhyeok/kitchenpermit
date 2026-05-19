"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import { getSafeNextPath } from "@/lib/auth/redirects";

type AuthMode = "login" | "signup";
type AuthStatusMessage = {
  tone: "success" | "warning" | "error";
  title: string;
  copy: string;
};

function statusMessage(
  value: string | null,
  signedOut: string | null,
): AuthStatusMessage | null {
  if (signedOut) {
    return {
      tone: "success" as const,
      title: "Signed out",
      copy: "Use Google or email/password to return to your account workspace.",
    };
  }

  if (value === "google-missing") {
    return {
      tone: "warning" as const,
      title: "Google sign-in is not ready",
      copy: "Use email and password on this local build.",
    };
  }

  if (value === "failed") {
    return {
      tone: "error" as const,
      title: "Could not sign in",
      copy: "The email or password did not match an account. Check both fields and try again.",
    };
  }

  if (value === "exists") {
    return {
      tone: "warning" as const,
      title: "Account already exists",
      copy: "Switch to Log in and use that email.",
    };
  }

  if (value === "password-mismatch") {
    return {
      tone: "error" as const,
      title: "Passwords do not match",
      copy: "Re-enter the same password in both fields.",
    };
  }

  if (value === "weak-password") {
    return {
      tone: "error" as const,
      title: "Password is too short",
      copy: "Use at least 8 characters.",
    };
  }

  if (value === "password-reset") {
    return {
      tone: "success" as const,
      title: "Password updated",
      copy: "Use the new password to return to your account workspace.",
    };
  }

  return null;
}

function clientStatusMessage(copy: string): AuthStatusMessage {
  return {
    tone: "error" as const,
    title: "Check the form",
    copy,
  };
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextBasePath = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams],
  );
  const [initialHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash || "",
  );
  const nextPath = useMemo(() => {
    if (!initialHash || nextBasePath.includes("#")) {
      return nextBasePath;
    }

    return `${nextBasePath}${initialHash}`;
  }, [initialHash, nextBasePath]);
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const message: AuthStatusMessage | null =
    clientMessage !== null
      ? clientStatusMessage(clientMessage)
      : statusMessage(searchParams.get("auth"), searchParams.get("signed_out"));
  const isSignup = mode === "signup";
  const fieldClassName =
    "h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-[#111315] outline-none transition placeholder:text-[#b2a69b] focus:border-[#111315]/40 focus:ring-4 focus:ring-[#111315]/8 aria-invalid:border-[#b42318]/50 aria-invalid:bg-[#fff8f6]";
  const labelClassName =
    "font-mono text-[10px] uppercase text-[#7b6f65]";

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
      <AnimatePresence initial={false}>
        {message ? (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className={`rounded-xl border px-3.5 py-3 text-sm font-semibold leading-6 ${
              message.tone === "error"
                ? "border-[#b42318]/28 bg-[#fff1ed] text-[#7a271a]"
                : message.tone === "warning"
                  ? "border-[#f26a21]/28 bg-[#fff7ef] text-[#7a3a12]"
                  : "border-[#1f7a4d]/24 bg-[#eff8f1] text-[#1c5334]"
            }`}
          >
            <div className="flex items-start gap-3">
              {message.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                <p className="font-black tracking-[-0.02em]">{message.title}</p>
                <p className="mt-0.5 text-xs leading-5 opacity-80">{message.copy}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="h-11 rounded-lg border-black/10 bg-white text-sm font-black text-[#111315] shadow-[0_10px_24px_rgba(26,20,16,0.06)] hover:bg-[#fbf7ef]"
      >
        <a href={`/auth/google?next=${encodeURIComponent(nextPath)}`}>
          <KeyRound className="h-4 w-4 text-[#75695f]" />
          Continue with Google
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[10px] font-black uppercase text-[#8a7b6d]">
        <span className="h-px bg-black/10" />
        email password
        <span className="h-px bg-black/10" />
      </div>

      <SegmentedControl
        type="single"
        value={mode}
        onValueChange={(value) => {
          if (value === "login" || value === "signup") {
            setMode(value);
            setClientMessage(null);
          }
        }}
        className="rounded-lg bg-[#f1eadf]"
      >
        <SegmentedControlItem value="login" className="rounded-md text-xs font-black uppercase">
          Log in
        </SegmentedControlItem>
        <SegmentedControlItem value="signup" className="rounded-md text-xs font-black uppercase">
          Create account
        </SegmentedControlItem>
      </SegmentedControl>

      <form
        action={isSignup ? "/auth/signup" : "/auth/login"}
        method="post"
        onSubmit={isSignup ? handleSignupSubmit : undefined}
        className="grid gap-3"
      >
        <input type="hidden" name="next" value={nextPath} />
        <label className="grid gap-2">
          <span className={labelClassName}>
            Work email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="owner@yourcompany.com"
            aria-invalid={message?.tone === "error" ? true : undefined}
            className={fieldClassName}
          />
          {isSignup ? (
            <span className="text-[11px] font-semibold leading-4 text-[#75695f]">
              Use an email you can access. Password reset links and account
              notices are sent there.
            </span>
          ) : null}
        </label>
        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3">
            <span className={labelClassName}>
              Password
            </span>
            {!isSignup ? (
              <a
                href="/forgot-password"
                className="text-[11px] font-black uppercase text-[#b94d11] underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            ) : null}
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
            aria-invalid={message?.tone === "error" ? true : undefined}
            className={fieldClassName}
          />
        </label>
        {isSignup ? (
          <label className="grid gap-2">
            <span className={labelClassName}>
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
              aria-invalid={message?.tone === "error" ? true : undefined}
              className={fieldClassName}
            />
          </label>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="mt-1 h-11 rounded-lg bg-[#111315] text-sm font-black text-white hover:bg-[#27221e]"
        >
          {isSignup ? "Create account" : "Log in"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-[#6f665e]">
        <p className="font-black text-[#111315]">Account manages company output</p>
        <p className="mt-1">
          Free builder stays open. Sign in to manage the company version; active
          subscription access unlocks saved company details, clean PDFs, live
          service report links, and account history.
        </p>
      </div>
    </div>
  );
}
