import type { ResumeFormValues } from "@/lib/validation/resume";

export function buildResumeFileName(
  values: ResumeFormValues,
  desiredJob?: string | null,
): string {
  const name = (values.fullName || "無題").replace(/\s+/g, "");
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const job = desiredJob && desiredJob.trim() ? `_${desiredJob.trim()}` : "";
  return `履歴書_${name}${job}_${ymd}.pdf`;
}
