"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileStack, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Downloads the combined résumé + CV PDF. `documentId` only scopes ownership;
// the set is rendered from the user's shared data.
export function SetPdfButton({ documentId }: { documentId: string }) {
  const t = useTranslations("Dashboard");
  const tt = useTranslations("Toast");
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf?documentId=${documentId}&set=1`);
      if (!res.ok) throw new Error("pdf failed");
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename\*=UTF-8''([^;]+)/);
      const fileName = match ? decodeURIComponent(match[1]) : "documents.pdf";
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success(tt("pdfReady"));
    } catch {
      toast.error(tt("pdfError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={download} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileStack className="size-4" />
      )}
      {loading ? t("generatingSet") : t("downloadSet")}
    </Button>
  );
}
