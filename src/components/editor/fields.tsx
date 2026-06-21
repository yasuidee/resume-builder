import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label required={required} optional={optional}>
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
