import type { ResumeFormValues } from "@/lib/validation/resume";

export function calcAge(birth: string): number | null {
  if (!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function formatBirth(birth: string): string {
  if (!birth) return "";
  const [y, m, d] = birth.split("-");
  if (!y || !m || !d) return birth;
  return `${Number(y)}年${Number(m)}月${Number(d)}日`;
}

export function splitYearMonth(ym: string): { year: string; month: string } {
  if (!ym) return { year: "", month: "" };
  const [y, m] = ym.split("-");
  return {
    year: y ? String(Number(y)) : "",
    month: m ? String(Number(m)) : "",
  };
}

export const EDU_STATUS_LABEL: Record<string, string> = {
  graduated: "卒業",
  expected: "卒業見込み",
  enrolled: "在学中",
  withdrawn: "中退",
};

export const GENDER_LABEL: Record<string, string> = {
  male: "男",
  female: "女",
  other: "—",
  unspecified: "",
};

export type HistoryRow = {
  year: string;
  month: string;
  text: string;
  center?: boolean;
};

export function buildEducationRows(values: ResumeFormValues): HistoryRow[] {
  const rows: HistoryRow[] = [];
  const filled = values.educations.filter(
    (e) => e.schoolName.trim() || e.schoolNameJa.trim(),
  );
  if (filled.length === 0) return rows;

  rows.push({ year: "", month: "", text: "学　歴", center: true });
  for (const e of filled) {
    const name = e.schoolNameJa.trim() || e.schoolName.trim();
    const faculty = e.faculty.trim() ? ` ${e.faculty.trim()}` : "";
    if (e.startDate) {
      const { year, month } = splitYearMonth(e.startDate);
      rows.push({ year, month, text: `${name}${faculty}　入学` });
    }
    const endLabel = e.status ? EDU_STATUS_LABEL[e.status] ?? "卒業" : "卒業";
    if (e.endDate) {
      const { year, month } = splitYearMonth(e.endDate);
      rows.push({ year, month, text: `${name}${faculty}　${endLabel}` });
    } else if (e.status === "enrolled") {
      rows.push({ year: "", month: "", text: `${name}${faculty}　在学中` });
    }
  }
  return rows;
}
