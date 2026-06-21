import "server-only";
import { chromium, type Browser } from "playwright";

// Reuse a single headless browser across requests (and HMR reloads in dev).
const g = globalThis as unknown as { __pwBrowser?: Promise<Browser> };

async function getBrowser(): Promise<Browser> {
  if (!g.__pwBrowser) {
    g.__pwBrowser = chromium.launch({ headless: true });
  }
  return g.__pwBrowser;
}

// Render an A4 PDF from a URL. The URL points at the chrome-less /print page,
// which renders the exact same ResumeDocument component as the preview.
export async function urlToPdf(url: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
  } finally {
    await page.close();
  }
}
