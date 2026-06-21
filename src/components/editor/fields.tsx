import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function StepCard({
  lead,
  children,
}: {
  lead: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="grid gap-5 p-6">
        <p className="rounded-xl bg-indigo-50/60 p-3 text-sm leading-relaxed text-indigo-900">
          {lead}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}

export function Field({
  label,
  required,
  optional,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  // Wrapping the control in a <label> gives every field an accessible name
  // without threading ids through react-hook-form's register().
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
        {label}
        {required && <span className="text-xs text-red-500">必須</span>}
        {optional && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-500">
            任意
          </span>
        )}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-red-500">{error}</span>
      ) : (
        hint && <span className="text-xs text-slate-400">{hint}</span>
      )}
    </label>
  );
}
