"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { History, Save, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { snapshotVersion } from "@/lib/actions/versions";
import { Button } from "@/components/ui/button";

export function VersionSaveButton({ documentId }: { documentId: string }) {
  const t = useTranslations("Versions");
  const tt = useTranslations("Toast");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function go() {
    setSaving(true);
    try {
      await snapshotVersion(documentId);
      setDone(true);
      toast.success(tt("versionSaved"));
      setTimeout(() => setDone(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={go} disabled={saving}>
        {done ? (
          <Check className="size-4 text-emerald-600" />
        ) : (
          <Save className="size-4" />
        )}
        {done ? t("saved") : t("save")}
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/documents/${documentId}/versions`}>
          <History className="size-4" />
          {t("history")}
        </Link>
      </Button>
    </div>
  );
}
