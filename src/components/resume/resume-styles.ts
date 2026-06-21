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
