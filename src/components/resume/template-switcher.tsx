"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { setTemplate, type ResumeTemplate } from "@/lib/actions/documents";
import { cn } from "@/lib/utils";

export function TemplateSwitcher({
  documentId,
  current,
}: {
  documentId: string;
  current: ResumeTemplate;
}) {
  const t = useTranslations("Preview");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(template: ResumeTemplate) {
    if (template === current) return;
    startTransition(async () => {
      await setTemplate(documentId, template);
      router.refresh();
    });
  }

  const options: { value: ResumeTemplate; label: string }[] = [
    { value: "classic", label: t("templateClassic") },
    { value: "modern", label: t("templateModern") },
  ];

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="hidden sm:inline">{t("template")}</span>
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={pending}
            onClick={() => choose(o.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              current === o.value
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
