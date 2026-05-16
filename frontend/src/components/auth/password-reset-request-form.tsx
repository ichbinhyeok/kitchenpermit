"use client";

import { AlertCircle, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PasswordResetRequestForm() {
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent") === "1";
  const resetHref = searchParams.get("reset");

  return (
    <div className="grid gap-5">
      {sent ? (
        <div
          role="status"
          className="rounded-xl border border-[#1f7a4d]/24 bg-[#eff8f1] px-3.5 py-3 text-sm font-semibold leading-6 text-[#1c5334]"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-black tracking-[-0.02em]">
                Check your email
              </p>
              <p className="mt-0.5 text-xs leading-5 opacity-80">
                If an account exists for that email, we sent a one-time password
                reset link.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm font-semibold leading-6 text-[#6f665e]">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b94d11]" />
            <div>
              <p className="font-black tracking-[-0.02em] text-[#111315]">
                Reset by email
              </p>
              <p className="mt-0.5 text-xs leading-5">
                Enter the email used for the company account. The link expires
                and can only be used once.
              </p>
            </div>
          </div>
        </div>
      )}

      {resetHref ? (
        <div className="rounded-xl border border-[#f26a21]/24 bg-[#fff7ef] px-3.5 py-3 text-sm font-semibold leading-6 text-[#7a3a12]">
          <p className="font-black tracking-[-0.02em]">
            Local test reset link
          </p>
          <p className="mt-0.5 text-xs leading-5 opacity-80">
            This appears only on localhost/dev reset requests.
          </p>
          <a
            href={resetHref}
            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#111315] px-4 text-[11px] font-black uppercase text-white transition hover:bg-[#27221e]"
          >
            Open reset link
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}

      <form
        action="/auth/password-reset/request"
        method="post"
        className="grid gap-3"
      >
        <label className="grid gap-2">
          <span className="font-mono text-[10px] uppercase text-[#7b6f65]">
            Account email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="owner@yourcompany.com"
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-[#111315] outline-none transition placeholder:text-[#b2a69b] focus:border-[#111315]/40 focus:ring-4 focus:ring-[#111315]/8"
          />
        </label>
        <Button
          type="submit"
          size="lg"
          className="mt-1 h-11 rounded-lg bg-[#111315] text-sm font-black text-white hover:bg-[#27221e]"
        >
          Send reset link
          <KeyRound className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
