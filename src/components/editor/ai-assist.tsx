"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2, Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TONES, type AIResult, type Tone } from "@/lib/ai/schemas";

export function AiAssist({
  label,
  withTone = false,
  run,
  onApply,
}: {
  label: string;
  withTone?: boolean;
  run: (tone: Tone) => Promise<AIResult>;
  onApply: (text: string) => void;
}) {
  const t = useTranslations("Ai");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<Tone>("standard");
  const [result, setResult] = useState<AIResult | null>(null);
  const [applied, setApplied] = useState(false);

  async function go() {
    setLoading(true);
    setApplied(false);
    try {
      setResult(await run(tone));
    } finally {
      setLoading(false);
    }
  }

  const confLabel =
    result &&
    { low: t("confLow"), mid: t("confMid"), high: t("confHigh") }[
      result.confidence
    ];

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {withTone && (
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            {t("tone")}
            <Select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="h-8 w-28 text-xs"
            >
              {TONES.map((to) => (
                <option key={to} value={to}>
                  {t(
                    `tone${to.charAt(0).toUpperCase()}${to.slice(1)}` as never,
                  )}
                </option>
              ))}
            </Select>
          </label>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={go}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4 text-indigo-600" />
          )}
          {loading ? t("generating") : label}
        </Button>
        {result && (
          <span className="text-[11px] text-slate-400">
            {t("confidence")}：{confLabel}
          </span>
        )}
      </div>

      {result && (
        <div className="mt-3 grid gap-3">
          {result.text ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {result.text}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onApply(result.text);
                    setApplied(true);
                  }}
                >
                  <Check className="size-4" />
                  {applied ? t("applied") : t("apply")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setResult(null)}
                >
                  <X className="size-4" />
                  {t("close")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">{t("emptyResult")}</p>
          )}

          {result.usedFacts.length > 0 && (
            <div className="text-xs text-slate-500">
              <span className="font-medium">{t("usedFacts")}：</span>
              <span className="flex flex-wrap gap-1.5 pt-1">
                {result.usedFacts.map((f, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200"
                  >
                    {f}
                  </span>
                ))}
              </span>
            </div>
          )}

          {result.clarifyingQuestions.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900">
              <p className="flex items-center gap-1 font-medium">
                <HelpCircle className="size-3.5" />
                {t("questions")}
              </p>
              <ul className="mt-1 list-disc pl-5">
                {result.clarifyingQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-slate-400">{t("noFabricationNote")}</p>
        </div>
      )}
    </div>
  );
}
