"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveConsents } from "@/lib/actions/consent";

export function PdfDownloadButton({ documentId }: { documentId: string }) {
  const t = useTranslations("Preview");
  const tc = useTranslations("Consent");
  const tt = useTranslations("Toast");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [career, setCareer] = useState(false);
  const [third, setThird] = useState(false);
  const [saving, setSaving] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf?documentId=${documentId}`);
      if (!res.ok) throw new Error("pdf failed");
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename\*=UTF-8''([^;]+)/);
      const fileName = match ? decodeURIComponent(match[1]) : "document.pdf";

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      toast.success(tt("pdfReady"));
      // The PDF is already in the user's hands before any consent prompt.
      setShowConsent(true);
    } catch {
      toast.error(tt("pdfError"));
    } finally {
      setLoading(false);
    }
  }

  async function agree() {
    setSaving(true);
    try {
      await saveConsents({
        locale,
        careerSupport: { granted: career, text: tc("careerSupport") },
        thirdParty: { granted: third, text: tc("thirdParty") },
      });
      toast.success(tt("consentSaved"));
      setShowConsent(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button onClick={download} disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {loading ? t("generating") : t("downloadPdf")}
      </Button>

      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                {tc("modalTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setShowConsent(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="close"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {tc("modalBody")}
            </p>

            <div className="mt-4 grid gap-3">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={career}
                  onChange={(e) => setCareer(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">
                  {tc("careerSupport")}
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={third}
                  onChange={(e) => setThird(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">{tc("thirdParty")}</span>
              </label>
            </div>

            <p className="mt-3 text-xs text-slate-400">{tc("note")}</p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <Button onClick={agree} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {tc("agree")}
              </Button>
              <Button variant="ghost" onClick={() => setShowConsent(false)}>
                {tc("skip")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
