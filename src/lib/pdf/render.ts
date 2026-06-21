export type DocKind = "resume" | "cv" | "set";

export function buildPdfFileName(
  kind: DocKind,
  fullName: string | null | undefined,
  desiredJob?: string | null,
): string {
  const name = (fullName || "無題").replace(/\s+/g, "");
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const job = desiredJob && desiredJob.trim() ? `_${desiredJob.trim()}` : "";
  const prefix =
    kind === "set" ? "応募書類" : kind === "cv" ? "職務経歴書" : "履歴書";
  return `${prefix}_${name}${job}_${ymd}.pdf`;
}
