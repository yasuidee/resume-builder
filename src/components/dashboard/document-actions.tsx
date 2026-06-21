"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { deleteDocument, renameDocument } from "@/lib/actions/documents";

export function DocumentActions({
  documentId,
  currentTitle,
}: {
  documentId: string;
  currentTitle: string;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function rename() {
    setOpen(false);
    const next = window.prompt(t("renamePrompt"), currentTitle);
    if (next === null) return;
    startTransition(async () => {
      await renameDocument(documentId, next);
      toast.success(t("renamed"));
      router.refresh();
    });
  }

  function remove() {
    setOpen(false);
    if (!window.confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      await deleteDocument(documentId);
      toast.success(t("docDeleted"));
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("actions")}
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MoreVertical className="size-4" />
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={rename}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="size-4" />
              {t("rename")}
            </button>
            <button
              type="button"
              onClick={remove}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              {t("delete")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
