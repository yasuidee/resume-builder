"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { aiCheckConsistency } from "@/lib/actions/ai";
import type { ConsistencyResult } from "@/lib/ai/schemas";
import { Button } from "@/components/ui/button";

export function ConsistencyCheck({ documentId }: { documentId: string }) {
  const t = useTranslations("Consistency");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConsistencyResult | null>(null);

  async function run() {
    setLoading(true);
    try {
      setResult(await aiCheckConsistency(documentId));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <ShieldCheck className="size-4 text-indigo-600" />
          {t("check")}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={run}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          {loading ? t("checking") : t("check")}
        </Button>
      </div>

      {result && (
        <div className="mt-3 text-sm">
          {result.issues.length === 0 ? (
            <p className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="size-4" />
              {t("noIssues")}
            </p>
          ) : (
            <ul className="grid gap-2">
              {result.issues.map((issue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-amber-900"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {t("checkedNote", { count: result.checkedFacts.length })}
          </p>
        </div>
      )}
    </div>
  );
}
