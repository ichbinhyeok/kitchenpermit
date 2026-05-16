"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const accountItems = [
  {
    label: "Company profile",
    copy: "Name, phone, service area, logo, and customer-facing accent color.",
    Icon: Building2,
  },
  {
    label: "Saved service records",
    copy: "Restaurant links and retained PDF copies stay connected to each job.",
    Icon: FileText,
  },
  {
    label: "Next-service queue",
    copy: "Upcoming service dates and open items are easier to find after login.",
    Icon: CalendarClock,
  },
] as const;

export function LoginProductPreview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="relative isolate flex min-h-[520px] flex-col justify-between overflow-hidden bg-[#111315] p-5 text-white sm:p-7 lg:min-h-[640px] lg:p-9"
      aria-label="Account workspace preview"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#f26a21]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0,transparent_32%),linear-gradient(180deg,#111315_0%,#17130f_100%)]" />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/14 bg-white/8">
              <Building2 className="h-4 w-4 text-[#ffb27c]" />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase text-white/48">
                KitchenPermit Account
              </p>
              <p className="text-sm font-black tracking-[-0.02em]">
                Report history after sign-in
              </p>
            </div>
          </div>
          <Badge className="border-white/12 bg-white/8 text-white/72" variant="outline">
            Company
          </Badge>
        </div>

        <h1 className="mt-9 max-w-2xl text-[2.35rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-[3rem] lg:text-[3.35rem]">
          Sign in to manage saved service records.
        </h1>
        <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-white/64 sm:text-base">
          Account keeps company details, restaurant-ready links, PDF copies, and
          next-service dates connected to each job.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.42, ease: "easeOut" }}
        className="mt-10 max-w-[560px] overflow-hidden rounded-xl border border-white/12 bg-white/[0.045] shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase text-white/42">
              After sign-in
            </p>
            <p className="mt-1 text-sm font-black">
              Account stores the company version
            </p>
          </div>
          <ShieldCheck className="h-4 w-4 text-[#ffb27c]" />
        </div>

        <div className="divide-y divide-white/10">
          {accountItems.map(({ label, copy, Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 + index * 0.06, duration: 0.28 }}
              className="grid grid-cols-[32px_1fr] gap-3 px-4 py-3.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Icon className="h-3.5 w-3.5 text-[#ffb27c]" />
              </span>
              <div>
                <p className="text-sm font-black">{label}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/52">
                  {copy}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-start gap-2 border-t border-white/10 px-4 py-3 text-xs font-semibold leading-5 text-white/52">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffb27c]" />
          <span>
            Company profile, customer links, and retained PDF copies stay tied
            to the service history.
          </span>
        </div>
      </motion.div>
    </motion.section>
  );
}
