import type { ResumeFormValues } from "@/lib/validation/resume";

// The finished resume is always rendered in Japanese, regardless of the UI
// locale (per product spec). This component is pure so it can be rendered both
// on the preview page and via renderToStaticMarkup in the PDF route.

function calcAge(birth: string): number | null {
  if (!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function formatBirth(birth: string): string {
  if (!birth) return "";
  const [y, m, d] = birth.split("-");
  if (!y || !m || !d) return birth;
  return `${Number(y)}年${Number(m)}月${Number(d)}日`;
}

function splitYearMonth(ym: string): { year: string; month: string } {
  if (!ym) return { year: "", month: "" };
  const [y, m] = ym.split("-");
  return { year: y ? String(Number(y)) : "", month: m ? String(Number(m)) : "" };
}

const EDU_STATUS_LABEL: Record<string, string> = {
  graduated: "卒業",
  expected: "卒業見込み",
  enrolled: "在学中",
  withdrawn: "中退",
};

const GENDER_LABEL: Record<string, string> = {
  male: "男",
  female: "女",
  other: "—",
  unspecified: "",
};

type HistoryRow = { year: string; month: string; text: string; center?: boolean };

function buildEducationRows(values: ResumeFormValues): HistoryRow[] {
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

export function ResumeDocument({ values }: { values: ResumeFormValues }) {
  const age = calcAge(values.birthDate);
  const gender = GENDER_LABEL[values.gender] ?? "";
  const eduRows = buildEducationRows(values);
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 現在`;

  const hasLanguage =
    values.japaneseLevel ||
    values.jlpt ||
    values.nativeLanguage ||
    values.englishLevel;

  return (
    <div className="rk-sheet">
      <div className="rk-header">
        <div className="rk-title">履　歴　書</div>
        <div className="rk-date">{dateStr}</div>
      </div>

      <table className="rk-table rk-top">
        <tbody>
          <tr>
            <th>ふりがな</th>
            <td colSpan={3}>
              <span className="rk-furigana">{values.fullNameKana}</span>
            </td>
            <td rowSpan={4} className="rk-photo">
              写真
            </td>
          </tr>
          <tr>
            <th>氏　名</th>
            <td colSpan={3}>
              <span className="rk-name">{values.fullName || "　"}</span>
              {values.romajiName ? (
                <span className="rk-furigana">　（{values.romajiName}）</span>
              ) : null}
            </td>
          </tr>
          <tr>
            <th>生年月日</th>
            <td colSpan={2}>
              {formatBirth(values.birthDate)}
              {age !== null ? `　（満${age}歳）` : ""}
            </td>
            <th style={{ width: "16mm" }}>性別</th>
          </tr>
          <tr>
            <th>　</th>
            <td colSpan={2}></td>
            <td className="rk-cell-center">{gender}</td>
          </tr>
          <tr>
            <th>ふりがな</th>
            <td colSpan={4}>
              <span className="rk-furigana">&nbsp;</span>
            </td>
          </tr>
          <tr>
            <th>現住所</th>
            <td colSpan={4}>{values.currentAddress}</td>
          </tr>
          <tr>
            <th>電話</th>
            <td colSpan={2}>{values.phone}</td>
            <th>メール</th>
            <td>{values.email}</td>
          </tr>
          {values.contactAddress ? (
            <tr>
              <th>連絡先</th>
              <td colSpan={4}>{values.contactAddress}</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="rk-section-title">学歴・職歴</div>
      <table className="rk-table rk-history">
        <thead>
          <tr>
            <th className="rk-col-year">年</th>
            <th className="rk-col-month">月</th>
            <th>学歴・職歴</th>
          </tr>
        </thead>
        <tbody>
          {eduRows.length === 0 ? (
            <tr>
              <td className="rk-cell-center"></td>
              <td className="rk-cell-center"></td>
              <td className="rk-muted">（学歴を入力すると、ここに表示されます）</td>
            </tr>
          ) : (
            eduRows.map((r, i) => (
              <tr key={i}>
                <td className="rk-cell-center">{r.year}</td>
                <td className="rk-cell-center">{r.month}</td>
                <td className={r.center ? "rk-cell-center" : undefined}>
                  {r.text}
                </td>
              </tr>
            ))
          )}
          <tr>
            <td className="rk-cell-center"></td>
            <td className="rk-cell-center"></td>
            <td className="rk-cell-right">以上</td>
          </tr>
        </tbody>
      </table>

      {values.showResidenceOnResume &&
      (values.residenceStatus || values.residenceExpiry) ? (
        <>
          <div className="rk-section-title">在留資格</div>
          <table className="rk-table">
            <tbody>
              <tr>
                <th>在留資格</th>
                <td>{values.residenceStatus}</td>
                <th>在留期限</th>
                <td>{formatBirth(values.residenceExpiry)}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : null}

      {hasLanguage ? (
        <>
          <div className="rk-section-title">語学</div>
          <table className="rk-table">
            <tbody>
              <tr>
                <th>日本語</th>
                <td>
                  {values.japaneseLevel}
                  {values.jlpt ? `（JLPT ${values.jlpt}）` : ""}
                </td>
              </tr>
              {values.nativeLanguage ? (
                <tr>
                  <th>母語</th>
                  <td>{values.nativeLanguage}</td>
                </tr>
              ) : null}
              {values.englishLevel ? (
                <tr>
                  <th>英語</th>
                  <td>{values.englishLevel}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}
