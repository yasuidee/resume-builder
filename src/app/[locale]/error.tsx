"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("Errors");
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <AlertTriangle className="mb-4 size-12 text-amber-400" />
      <h1 className="text-2xl font-bold text-slate-900">{t("errorTitle")}</h1>
      <p className="mt-2 max-w-md text-slate-600">{t("errorBody")}</p>
      <Button className="mt-6" onClick={reset}>
        {t("retry")}
      </Button>
    </main>
  );
}
