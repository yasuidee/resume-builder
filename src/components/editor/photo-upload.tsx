"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

// Downscale the chosen image to a small 3:4 JPEG data URL so it stays tiny in
// the database and embeds cleanly into the PDF.
function fileToScaledDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const targetW = 300;
        const targetH = 400;
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        // cover-fit the source into the 3:4 frame
        const scale = Math.max(targetW / img.width, targetH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const t = useTranslations("Editor");
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToScaledDataUrl(file);
    onChange(dataUrl);
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-28 w-21 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-slate-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
            style={{ width: "5.25rem", height: "7rem" }}
          />
        ) : (
          <UserRound className="size-7 text-slate-300" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={pick}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {value ? t("photoChange") : t("photoUpload")}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
            {t("photoRemove")}
          </Button>
        )}
        <p className="max-w-xs text-xs text-slate-400">{t("photoHint")}</p>
      </div>
    </div>
  );
}
