"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { FileText, Briefcase, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { createDocument, type DocumentType } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DocumentTypePicker({ cvEnabled }: { cvEnabled: boolean }) {
  const t = useTranslations("NewDocument");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState<DocumentType | null>(null);

  function create(type: DocumentType) {
    setCreating(type);
    startTransition(async () => {
      const { id } = await createDocument(type);
      router.push(`/documents/${id}/edit`);
    });
  }

  const options = [
    {
      type: "resume" as const,
      icon: FileText,
      title: t("resumeTitle"),
      desc: t("resumeDesc"),
      enabled: true,
    },
    {
      type: "cv" as const,
      icon: Briefcase,
      title: t("cvTitle"),
      desc: t("cvDesc"),
      enabled: cvEnabled,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {options.map((o) => (
        <Card
          key={o.type}
          className={cn(
            "transition-shadow",
            o.enabled ? "hover:shadow-md" : "opacity-60",
          )}
        >
          <CardContent className="flex h-full flex-col gap-4 p-6">
            <o.icon className="size-8 text-indigo-600" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {o.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {o.desc}
              </p>
            </div>
            <Button
              type="button"
              disabled={!o.enabled || pending}
              onClick={() => create(o.type)}
            >
              {pending && creating === o.type && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {o.enabled ? t("create") : t("cvComingSoon")}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
