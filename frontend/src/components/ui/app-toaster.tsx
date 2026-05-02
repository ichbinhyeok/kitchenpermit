"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      richColors
      position="bottom-center"
      className="pdf-print-hide"
      toastOptions={{
        className:
          "pdf-print-hide font-sans text-sm shadow-[0_18px_50px_rgba(17,17,17,0.14)]",
      }}
    />
  );
}
