"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { setConsent, deleteMyData } from "@/lib/actions/consent";
import type { ConsentState, ConsentType } from "@/lib/consent-constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PrivacyControls({ initial }: { initial: ConsentState }) {
  const t = useTranslations("Privacy");
  const locale = useLocale();
  const router = useRouter();
  const [state, setState] = useState<ConsentState>(initial);
  const [pendingType, setPendingType] = useState<ConsentType | null>(null);
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  function toggle(type: ConsentType, text: string) {
    const next = !state[type];
    setPendingType(type);
    startTransition(async () => {
      await setConsent(type, next, text, locale);
      setState((s) => ({ ...s, [type]: next }));
      setPendingType(null);
    });
  }

  async function remove() {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    try {
      await deleteMyData();
      alert(t("deleted"));
      router.push("/dashboard");
    } finally {
      setDeleting(false);
    }
  }

  const rows: { type: ConsentType; title: string; desc: string }[] = [
    {
      type: "career_support",
      title: t("careerSupportTitle"),
      desc: t("careerSupportDesc"),
    },
    {
      type: "third_party_company_submission",
      title: t("thirdPartyTitle"),
      desc: t("thirdPartyDesc"),
    },
  ];

  return (
    <div className="grid gap-4">
      {rows.map((row) => {
        const granted = state[row.type];
        return (
          <Card key={row.type}>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{row.title}</p>
                <p className="mt-1 text-sm text-slate-600">{row.desc}</p>
                <span
                  className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                    granted ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {granted && <Check className="size-3.5" />}
                  {granted ? t("granted") : t("notGranted")}
                </span>
              </div>
              <Button
                variant={granted ? "outline" : "default"}
                size="sm"
                disabled={pendingType === row.type}
                onClick={() => toggle(row.type, row.desc)}
              >
                {pendingType === row.type && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {granted ? t("withdraw") : t("grant")}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-red-200">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="font-semibold text-red-700">{t("deleteTitle")}</p>
            <p className="mt-1 text-sm text-slate-600">{t("deleteDesc")}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={remove}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {t("deleteButton")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
