import "server-only";
import type { Browser } from "playwright-core";

// Reuse a single headless browser across requests (and HMR reloads in dev).
const g = globalThis as unknown as { __pwBrowser?: Promise<Browser> };

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function launch(): Promise<Browser> {
  if (isServerless()) {
    // Vercel / AWS Lambda: use a Lambda-compatible Chromium binary.
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: pw } = await import("playwright-core");
    return pw.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  // Local development: use the full Playwright browser (devDependency).
  // Non-literal specifier so the bundler doesn't trace this heavy, local-only
  // package into the serverless function.
  const localPkg = "playwright";
  const { chromium } = (await import(localPkg)) as typeof import("playwright");
  return chromium.launch({ headless: true });
}

async function getBrowser(): Promise<Browser> {
  if (!g.__pwBrowser) {
    g.__pwBrowser = launch() as Promise<Browser>;
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
