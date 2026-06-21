"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, Loader2, Check } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { restoreVersion } from "@/lib/actions/versions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type VersionItem = {
  id: string;
  versionNumber: number;
  changeSummary: string | null;
  createdAt: string;
};

export function VersionList({ versions }: { versions: VersionItem[] }) {
  const t = useTranslations("Versions");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  function restore(id: string) {
    setActiveId(id);
    startTransition(async () => {
      const r = await restoreVersion(id);
      if (r.ok && r.documentId) {
        router.push(`/documents/${r.documentId}/edit`);
      }
    });
  }

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));

  return (
    <ul className="grid gap-3">
      {versions.map((v) => (
        <li key={v.id}>
          <Card>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {t("versionLabel", { n: v.versionNumber })}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t("savedAt")} {fmt(v.createdAt)}
                  {v.changeSummary ? `・${v.changeSummary}` : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => restore(v.id)}
                disabled={pending}
              >
                {pending && activeId === v.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCcw className="size-4" />
                )}
                {t("restore")}
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
