"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { fetchApi } from "@/lib/api";
import { buildEmailDraftUrl } from "@/lib/start-request";

type InquiryCreateResponse = {
  id: string;
};

type StartRequestField =
  | "companyName"
  | "contactName"
  | "email"
  | "phone"
  | "serviceArea"
  | "productInterest"
  | "notes";

type StartRequestPayload = Record<StartRequestField, string>;
type StartRequestFieldErrors = Partial<Record<StartRequestField, string>>;

const requiredFieldOrder: StartRequestField[] = [
  "companyName",
  "contactName",
  "email",
  "serviceArea",
];

function validateStartRequest(payload: StartRequestPayload) {
  const errors: StartRequestFieldErrors = {};

  if (payload.companyName.length < 2) {
    errors.companyName = "Enter the company name.";
  }

  if (payload.contactName.length < 2) {
    errors.contactName = "Enter the primary contact.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = "Enter a working email address.";
  }

  if (payload.serviceArea.length < 2) {
    errors.serviceArea = "Enter the market or service area.";
  }

  return errors;
}

function StartFieldError({
  field,
  errors,
}: {
  field: StartRequestField;
  errors: StartRequestFieldErrors;
}) {
  const message = errors[field];

  if (!message) {
    return null;
  }

  return (
    <p id={`${field}-error`} className="text-xs font-medium leading-5 text-danger">
      {message}
    </p>
  );
}

export function StartRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<StartRequestFieldErrors>({});

  function fieldClassName(field: StartRequestField, rounded = "rounded-[22px]") {
    return `${rounded} border bg-white/86 px-4 py-3.5 text-foreground outline-none transition placeholder:text-muted-foreground/62 focus:border-[#111315] focus:bg-white focus:ring-4 focus:ring-[rgba(242,106,33,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111315] ${
      fieldErrors[field]
        ? "border-danger/60 ring-4 ring-[rgba(188,61,31,0.08)]"
        : "border-border"
    }`;
  }

  function clearFieldError(field: StartRequestField) {
    if (!fieldErrors[field]) {
      return;
    }

    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload: StartRequestPayload = {
      companyName: String(formData.get("companyName") ?? "").trim(),
      contactName: String(formData.get("contactName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      serviceArea: String(formData.get("serviceArea") ?? "").trim(),
      productInterest: String(formData.get("productInterest") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    };
    const validationErrors = validateStartRequest(payload);
    const firstInvalidField = requiredFieldOrder.find((field) => validationErrors[field]);

    if (firstInvalidField) {
      setFieldErrors(validationErrors);
      setErrorMessage("Complete the highlighted fields before sending the setup help request.");
      window.requestAnimationFrame(() => {
        const input = formElement.elements.namedItem(firstInvalidField);
        if (input instanceof HTMLElement) {
          input.focus();
        }
      });
      return;
    }

    setFieldErrors({});

    const fallbackEmailDraftUrl = buildEmailDraftUrl(payload);

    try {
      const response = await fetchApi("/api/public/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setErrorMessage(
          "The inquiry could not be saved. Opening a prepared email instead.",
        );
        window.location.href = fallbackEmailDraftUrl;
        return;
      }

      const inquiry = (await response.json()) as InquiryCreateResponse;
      startTransition(() => {
        router.push(`/start/submitted?leadId=${inquiry.id}`);
      });
    } catch {
      setErrorMessage(
        "The inquiry could not reach the backend. Opening a prepared email instead.",
      );
      window.location.href = fallbackEmailDraftUrl;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Company
          </span>
          <input
            name="companyName"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.companyName)}
            aria-describedby={fieldErrors.companyName ? "companyName-error" : undefined}
            onChange={() => clearFieldError("companyName")}
            className={fieldClassName("companyName")}
            placeholder="ABC Hood Service"
          />
          <StartFieldError field="companyName" errors={fieldErrors} />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Primary contact
          </span>
          <input
            name="contactName"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.contactName)}
            aria-describedby={fieldErrors.contactName ? "contactName-error" : undefined}
            onChange={() => clearFieldError("contactName")}
            className={fieldClassName("contactName")}
            placeholder="Jordan Lee"
          />
          <StartFieldError field="contactName" errors={fieldErrors} />
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
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            onChange={() => clearFieldError("email")}
            className={fieldClassName("email")}
            placeholder="ops@example.com"
          />
          <StartFieldError field="email" errors={fieldErrors} />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Phone
          </span>
          <input
            name="phone"
            className={fieldClassName("phone")}
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
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.serviceArea)}
            aria-describedby={fieldErrors.serviceArea ? "serviceArea-error" : undefined}
            onChange={() => clearFieldError("serviceArea")}
            className={fieldClassName("serviceArea")}
            placeholder="Austin / San Antonio / DFW"
          />
          <StartFieldError field="serviceArea" errors={fieldErrors} />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Request type
          </span>
          <select
            name="productInterest"
            className={fieldClassName("productInterest")}
            defaultValue="Setup help from $249"
          >
            <option>Setup help from $249</option>
            <option>Company version early access</option>
            <option>Pricing question</option>
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
          className={fieldClassName("notes", "rounded-[26px]")}
          placeholder="Logo, report color, wording, PDF design, company defaults, sample feedback, or timing."
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
        {isPending ? "Saving request..." : "Send setup help request"}
      </button>
    </form>
  );
}
