"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type InquiryCreateResponse = {
  id: string;
};

export function StartRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      companyName: String(formData.get("companyName") ?? "").trim(),
      contactName: String(formData.get("contactName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      serviceArea: String(formData.get("serviceArea") ?? "").trim(),
      productInterest: String(formData.get("productInterest") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/public/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setErrorMessage("The request could not be saved. Check the fields and try again.");
        return;
      }

      const inquiry = (await response.json()) as InquiryCreateResponse;
      startTransition(() => {
        router.push(`/start/submitted?leadId=${inquiry.id}`);
      });
    } catch {
      setErrorMessage("The request could not reach the backend. Confirm the API is running.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Company
          </span>
          <input
            name="companyName"
            required
            className="rounded-[22px] border border-border bg-white/86 px-4 py-3.5 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(242,106,33,0.12)]"
            placeholder="Masked Vendor Co."
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Primary contact
          </span>
          <input
            name="contactName"
            required
            className="rounded-[22px] border border-border bg-white/86 px-4 py-3.5 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(242,106,33,0.12)]"
            placeholder="Jordan Lee"
          />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            className="rounded-[22px] border border-border bg-white/86 px-4 py-3.5 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(242,106,33,0.12)]"
            placeholder="ops@vendor.com"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Phone
          </span>
          <input
            name="phone"
            className="rounded-[22px] border border-border bg-white/86 px-4 py-3.5 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(242,106,33,0.12)]"
            placeholder="512-555-0100"
          />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Service area
          </span>
          <input
            name="serviceArea"
            required
            className="rounded-[22px] border border-border bg-white/86 px-4 py-3.5 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(242,106,33,0.12)]"
            placeholder="Austin / San Antonio / DFW"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Product interest
          </span>
          <select
            name="productInterest"
            className="rounded-[22px] border border-border bg-white/86 px-4 py-3.5 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(242,106,33,0.12)]"
            defaultValue="Service packets + sales lists"
          >
            <option>Service packets</option>
            <option>Sales lists</option>
            <option>Service packets + sales lists</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Operational notes
        </span>
        <textarea
          name="notes"
          rows={5}
          className="rounded-[26px] border border-border bg-white/86 px-4 py-3.5 text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(242,106,33,0.12)]"
          placeholder="Current service area, preferred batch focus, packet needs, or timing."
        />
      </label>
      {errorMessage ? (
        <p className="border border-[rgba(188,61,31,0.28)] bg-[rgba(188,61,31,0.08)] px-4 py-3 text-sm text-danger">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-3 inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(242,106,33,0.18)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Saving request..." : "Continue"}
      </button>
    </form>
  );
}
