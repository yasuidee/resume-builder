"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PdfDownloadButton({ documentId }: { documentId: string }) {
  const t = useTranslations("Preview");
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf?documentId=${documentId}`);
      if (!res.ok) throw new Error("pdf failed");
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename\*=UTF-8''([^;]+)/);
      const fileName = match ? decodeURIComponent(match[1]) : "resume.pdf";

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("PDFの作成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={download} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {loading ? t("generating") : t("downloadPdf")}
    </Button>
  );
}
