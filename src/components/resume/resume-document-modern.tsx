import type { ResumeFormValues } from "@/lib/validation/resume";
import {
  calcAge,
  formatBirth,
  buildEducationRows,
  GENDER_LABEL,
} from "@/components/resume/resume-format";

// "Modern" résumé template — same data as the classic JIS template, cleaner
// single-column presentation. Always Japanese output.
export function ResumeDocumentModern({
  values,
}: {
  values: ResumeFormValues;
}) {
  const age = calcAge(values.birthDate);
  const gender = GENDER_LABEL[values.gender] ?? "";
  const eduRows = buildEducationRows(values).filter((r) => !r.center);
  const hasLanguage =
    values.japaneseLevel ||
    values.jlpt ||
    values.nativeLanguage ||
    values.englishLevel;

  return (
    <div className="rkm-sheet">
      <div className="rkm-head">
        <div>
          <div className="rkm-furigana">{values.fullNameKana}</div>
          <div className="rkm-name">{values.fullName || "　"}</div>
          {values.romajiName ? (
            <div className="rkm-romaji">{values.romajiName}</div>
          ) : null}
          <div className="rkm-contact">
            {values.birthDate ? (
              <span>
                {formatBirth(values.birthDate)}
                {age !== null ? `（${age}歳）` : ""}
              </span>
            ) : null}
            {gender ? <span>{gender}</span> : null}
            {values.phone ? <span>☎ {values.phone}</span> : null}
            {values.email ? <span>✉ {values.email}</span> : null}
          </div>
          {values.currentAddress ? (
            <div className="rkm-contact">
              <span>〒 {values.currentAddress}</span>
            </div>
          ) : null}
        </div>
        {values.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="rkm-photo" src={values.photoUrl} alt="" />
        ) : (
          <div className="rkm-photo">写真</div>
        )}
      </div>

      <div className="rkm-section">
        <div className="rkm-section-title">学歴</div>
        {eduRows.length === 0 ? (
          <div className="rkm-muted">（学歴を入力するとここに表示されます）</div>
        ) : (
          eduRows.map((r, i) => (
            <div className="rkm-row" key={i}>
              <div className="rkm-date">
                {r.year ? `${r.year}年` : ""}
                {r.month ? `${r.month}月` : ""}
              </div>
              <div className="rkm-text">{r.text}</div>
            </div>
          ))
        )}
      </div>

      {values.showResidenceOnResume &&
      (values.residenceStatus || values.residenceExpiry) ? (
        <div className="rkm-section">
          <div className="rkm-section-title">在留資格</div>
          <div className="rkm-kv">
            <div className="rkm-kv-label">在留資格</div>
            <div>{values.residenceStatus}</div>
          </div>
          {values.residenceExpiry ? (
            <div className="rkm-kv">
              <div className="rkm-kv-label">在留期限</div>
              <div>{formatBirth(values.residenceExpiry)}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {hasLanguage ? (
        <div className="rkm-section">
          <div className="rkm-section-title">語学</div>
          <div className="rkm-kv">
            <div className="rkm-kv-label">日本語</div>
            <div>
              {/^N[1-5]$/.test(values.japaneseLevel)
                ? `日本語能力試験 ${values.japaneseLevel}`
                : values.japaneseLevel === "試験前"
                  ? "日本語能力試験 受験前"
                  : values.japaneseLevel}
            </div>
          </div>
          {values.nativeLanguage ? (
            <div className="rkm-kv">
              <div className="rkm-kv-label">母語</div>
              <div>{values.nativeLanguage}</div>
            </div>
          ) : null}
          {values.englishLevel ? (
            <div className="rkm-kv">
              <div className="rkm-kv-label">英語</div>
              <div>{values.englishLevel}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
