"use client";

import { AlertCircle, ArrowRight, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

function resetMessage(value: string | null) {
  if (value === "expired-token") {
    return "That reset link expired. Request a new password reset email.";
  }

  if (value === "invalid-token") {
    return "That reset link is no longer valid. Request a new password reset email.";
  }

  if (value === "password-mismatch") {
    return "Enter the same new password in both fields.";
  }

  if (value === "weak-password") {
    return "Use a password with at least 8 characters.";
  }

  return null;
}

export function PasswordResetConfirmForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const serverMessage = resetMessage(searchParams.get("auth"));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const message = clientMessage || serverMessage;
  const canSubmit = token.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (password.length < 8) {
      event.preventDefault();
      setClientMessage("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setClientMessage("Enter the same new password in both fields.");
    }
  }

  return (
    <div className="grid gap-5">
      {message || !canSubmit ? (
        <div
          role="alert"
          className="rounded-xl border border-[#b42318]/28 bg-[#fff1ed] px-3.5 py-3 text-sm font-semibold leading-6 text-[#7a271a]"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-black tracking-[-0.02em]">
                Check the reset link
              </p>
              <p className="mt-0.5 text-xs leading-5 opacity-80">
                {message || "Open the reset link from your email before setting a new password."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm font-semibold leading-6 text-[#6f665e]">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#b94d11]" />
            <div>
              <p className="font-black tracking-[-0.02em] text-[#111315]">
                Set a new password
              </p>
              <p className="mt-0.5 text-xs leading-5">
                After this saves, the old password stops working.
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        action="/auth/password-reset/confirm"
        method="post"
        onSubmit={handleSubmit}
        className="grid gap-3"
      >
        <input type="hidden" name="token" value={token} />
        <label className="grid gap-2">
          <span className="font-mono text-[10px] uppercase text-[#7b6f65]">
            New password
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setClientMessage(null);
            }}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-[#111315] outline-none transition placeholder:text-[#b2a69b] focus:border-[#111315]/40 focus:ring-4 focus:ring-[#111315]/8 disabled:cursor-not-allowed disabled:bg-[#f1eadf] disabled:text-[#75695f]"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[10px] uppercase text-[#7b6f65]">
            Confirm new password
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
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-[#111315] outline-none transition placeholder:text-[#b2a69b] focus:border-[#111315]/40 focus:ring-4 focus:ring-[#111315]/8 disabled:cursor-not-allowed disabled:bg-[#f1eadf] disabled:text-[#75695f]"
          />
        </label>
        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="mt-1 h-11 rounded-lg bg-[#111315] text-sm font-black text-white hover:bg-[#27221e] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Update password
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
