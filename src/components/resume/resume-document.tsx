import type { ResumeFormValues } from "@/lib/validation/resume";
import {
  calcAge,
  formatBirth,
  buildEducationRows,
  GENDER_LABEL,
} from "@/components/resume/resume-format";

// The finished resume is always rendered in Japanese, regardless of the UI
// locale (per product spec). This component is pure so it can be rendered both
// on the preview page and in the chrome-less /print page for PDF generation.

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
            <td rowSpan={3} className="rk-photo">
              {values.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.photoUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "写真"
              )}
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
            <td>
              {formatBirth(values.birthDate)}
              {age !== null ? `　（満${age}歳）` : ""}
            </td>
            <th style={{ width: "16mm" }}>性別</th>
            <td className="rk-cell-center">{gender || "　"}</td>
          </tr>
          <tr>
            <th>現住所</th>
            <td colSpan={4}>{values.currentAddress}</td>
          </tr>
          <tr>
            <th>電話</th>
            <td>{values.phone}</td>
            <th>メール</th>
            <td colSpan={2}>{values.email}</td>
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
