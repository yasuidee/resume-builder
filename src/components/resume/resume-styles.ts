// Self-contained CSS for the resume sheet. Injected verbatim into both the
// on-screen preview and the Playwright-generated PDF so the two always match.
// No Tailwind here — the PDF renderer has no access to the app stylesheet.
export const resumeCss = `
.rk-sheet {
  width: 190mm;
  margin: 0 auto;
  background: #ffffff;
  color: #111418;
  box-sizing: border-box;
  padding: 12mm;
  font-family: "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
  font-size: 10.5pt;
  line-height: 1.5;
}
.rk-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6mm;
}
.rk-title {
  font-size: 20pt;
  font-weight: 700;
  letter-spacing: 0.4em;
}
.rk-date {
  font-size: 9pt;
  color: #444;
  align-self: flex-end;
}
.rk-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.rk-table th,
.rk-table td {
  border: 1px solid #333;
  padding: 2mm 3mm;
  vertical-align: middle;
  text-align: left;
  word-break: break-word;
}
.rk-table th {
  background: #f1f3f5;
  font-weight: 600;
  white-space: nowrap;
  width: 28mm;
}
.rk-furigana {
  font-size: 8pt;
  color: #555;
}
.rk-name {
  font-size: 15pt;
  font-weight: 700;
}
.rk-photo {
  width: 30mm;
  height: 40mm;
  border: 1px solid #999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 8pt;
  text-align: center;
  margin-left: 6mm;
  flex: 0 0 auto;
}
.rk-section-title {
  margin: 6mm 0 1.5mm;
  font-size: 11pt;
  font-weight: 700;
  border-left: 4px solid #4f46e5;
  padding-left: 2mm;
}
.rk-history th.rk-col-year { width: 18mm; text-align: center; }
.rk-history th.rk-col-month { width: 14mm; text-align: center; }
.rk-history td.rk-cell-center { text-align: center; }
.rk-history td.rk-cell-right { text-align: right; }
.rk-muted { color: #888; }
.rk-top td { vertical-align: top; }
@media print {
  .rk-sheet { width: auto; padding: 0; }
}
`;

// "Modern" résumé template — a clean, single-column contemporary layout.
export const resumeModernCss = `
.rkm-sheet {
  width: 190mm;
  margin: 0 auto;
  background: #ffffff;
  color: #1f2937;
  box-sizing: border-box;
  padding: 14mm;
  font-family: "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
  font-size: 10.5pt;
  line-height: 1.7;
}
.rkm-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10mm; border-bottom: 2px solid #4f46e5; padding-bottom: 5mm; }
.rkm-name { font-size: 22pt; font-weight: 700; letter-spacing: 0.04em; }
.rkm-furigana { font-size: 9pt; color: #6b7280; }
.rkm-romaji { font-size: 10pt; color: #6b7280; margin-top: 1mm; }
.rkm-contact { margin-top: 3mm; font-size: 9.5pt; color: #374151; }
.rkm-contact span { margin-right: 5mm; white-space: nowrap; }
.rkm-photo { width: 28mm; height: 36mm; border: 1px solid #d1d5db; border-radius: 2mm; object-fit: cover; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 8pt; overflow: hidden; }
.rkm-section { margin-top: 7mm; }
.rkm-section-title { font-size: 12pt; font-weight: 700; color: #4f46e5; letter-spacing: 0.08em; margin-bottom: 2.5mm; }
.rkm-row { display: flex; gap: 4mm; padding: 1.5mm 0; border-bottom: 1px solid #f1f3f5; }
.rkm-row:last-child { border-bottom: none; }
.rkm-date { flex: 0 0 26mm; color: #6b7280; font-size: 9.5pt; white-space: nowrap; }
.rkm-text { flex: 1; }
.rkm-kv { display: flex; gap: 4mm; padding: 1mm 0; }
.rkm-kv-label { flex: 0 0 26mm; color: #6b7280; font-weight: 600; }
.rkm-muted { color: #9ca3af; }
@media print {
  .rkm-sheet { width: auto; padding: 0; }
}
`;
