import { parseSkills, type CvFormValues } from "@/lib/validation/cv";

function ym(value: string): string {
  if (!value) return "";
  const [y, m] = value.split("-");
  if (!y) return value;
  return m ? `${Number(y)}年${Number(m)}月` : `${Number(y)}年`;
}

function period(start: string, end: string, isCurrent: boolean): string {
  const s = ym(start);
  const e = isCurrent ? "現在" : ym(end);
  if (!s && !e) return "";
  return `${s} 〜 ${e}`;
}

export function CvDocument({ values }: { values: CvFormValues }) {
  const skills = parseSkills(values.skillsText);
  const works = values.works.filter(
    (w) => w.companyName.trim() || w.description.trim(),
  );
  const certs = values.certifications.filter((c) => c.name.trim());
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 現在`;

  return (
    <div className="rk-sheet">
      <div className="rk-header">
        <div className="rk-title">職務経歴書</div>
        <div className="rk-date">{dateStr}</div>
      </div>

      <div className="rk-section-title">職務要約</div>
      <p style={{ margin: "0 0 4mm", whiteSpace: "pre-wrap" }}>
        {values.careerSummary || (
          <span className="rk-muted">（職務要約を入力するとここに表示されます）</span>
        )}
      </p>

      <div className="rk-section-title">職務経歴</div>
      {works.length === 0 ? (
        <p className="rk-muted">（職歴を入力するとここに表示されます）</p>
      ) : (
        works.map((w, i) => (
          <table className="rk-table" key={i} style={{ marginBottom: "3mm" }}>
            <tbody>
              <tr>
                <th style={{ width: "40mm" }}>期間</th>
                <td>{period(w.startDate, w.endDate, w.isCurrent)}</td>
              </tr>
              <tr>
                <th>会社名</th>
                <td>
                  {w.companyNameJa.trim() || w.companyName}
                  {w.position ? `／${w.position}` : ""}
                  {w.employmentType ? `（${w.employmentType}）` : ""}
                </td>
              </tr>
              {w.description ? (
                <tr>
                  <th>業務内容</th>
                  <td style={{ whiteSpace: "pre-wrap" }}>{w.description}</td>
                </tr>
              ) : null}
              {w.achievements ? (
                <tr>
                  <th>実績</th>
                  <td style={{ whiteSpace: "pre-wrap" }}>{w.achievements}</td>
                </tr>
              ) : null}
              {w.tools ? (
                <tr>
                  <th>使用ツール</th>
                  <td>{w.tools}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ))
      )}

      {skills.length > 0 ? (
        <>
          <div className="rk-section-title">活かせる経験・スキル</div>
          <p style={{ margin: "0 0 4mm" }}>{skills.join("、")}</p>
        </>
      ) : null}

      {certs.length > 0 ? (
        <>
          <div className="rk-section-title">資格</div>
          <table className="rk-table">
            <tbody>
              {certs.map((c, i) => (
                <tr key={i}>
                  <td style={{ width: "30mm" }}>{ym(c.acquiredDate)}</td>
                  <td>
                    {c.name}
                    {c.issuer ? `（${c.issuer}）` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      {values.selfPr ? (
        <>
          <div className="rk-section-title">自己PR</div>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{values.selfPr}</p>
        </>
      ) : null}
    </div>
  );
}
