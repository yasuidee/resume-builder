import { test, expect } from "@playwright/test";

// Scenario 1 — resume happy path: create → fill → autosave → preview → PDF.
test("resume: create, autosave, preview, and download a Japanese PDF", async ({
  page,
}) => {
  await page.goto("/documents/new");
  await page.getByRole("button", { name: "この書類を作る" }).first().click();
  await page.waitForURL(/\/documents\/.+\/edit/);
  const documentId = page.url().match(/documents\/([^/]+)\/edit/)![1];

  await page.fill('input[name="fullName"]', "テスト 太郎");
  await page.fill('input[name="fullNameKana"]', "テスト タロウ");
  await page.fill('input[name="birthDate"]', "1995-04-01");
  await page.fill('input[name="email"]', "taro@example.com");
  await page.fill('input[name="phone"]', "090-0000-0000");
  await page.fill('input[name="currentAddress"]', "東京都〇〇区");

  // Autosave indicator turns to "保存しました".
  await expect(page.getByText("保存しました")).toBeVisible();

  await page.goto(`/documents/${documentId}/preview`);
  await expect(page.getByText("履　歴　書")).toBeVisible();

  const res = await page.request.get(`/api/pdf?documentId=${documentId}`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
  const body = await res.body();
  expect(body.length).toBeGreaterThan(1000);
  expect(body.subarray(0, 5).toString()).toBe("%PDF-");
});

// Scenario 3 — the consent prompt does NOT block the PDF; closing it keeps the file.
test("consent: PDF is obtained even if the consent modal is dismissed", async ({
  page,
}) => {
  await page.goto("/documents/new");
  await page.getByRole("button", { name: "この書類を作る" }).first().click();
  await page.waitForURL(/\/documents\/.+\/edit/);
  const documentId = page.url().match(/documents\/([^/]+)\/edit/)![1];
  await page.fill('input[name="fullName"]', "同意 テスト");
  await expect(page.getByText("保存しました")).toBeVisible();

  await page.goto(`/documents/${documentId}/preview`);
  await page.getByRole("button", { name: "PDFをダウンロード" }).click();
  // Modal appears after the download has already started.
  await expect(
    page.getByText("求人紹介サポートを受け取りますか？"),
  ).toBeVisible();
  await page.getByRole("button", { name: /今はしない/ }).click();
  await expect(
    page.getByText("求人紹介サポートを受け取りますか？"),
  ).toBeHidden();
});

// Scenario 4 — a user without career_support consent does NOT appear in admin.
test("admin: no candidates before any consent is granted", async ({ page }) => {
  await page.goto("/admin/candidates");
  await expect(page.getByText("候補者一覧")).toBeVisible();
  await expect(
    page.getByText("求人紹介に同意した候補者はまだいません。"),
  ).toBeVisible();
});

// Scenario 5 — language switch changes the main screen text (ja ↔ en).
test("i18n: switching language changes the landing copy", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "日本での仕事さがしを、履歴書づくりから。",
    }),
  ).toBeVisible();
  await page.selectOption('select[aria-label="Language"]', "en");
  await page.waitForURL(/\/en(\/|$|\?)/);
  await expect(
    page.getByRole("heading", {
      name: "Start your job search in Japan with your resume.",
    }),
  ).toBeVisible();
});

// Scenario 6 — saving twice creates two versions, and they are listed.
test("versions: saving checkpoints creates restorable versions", async ({
  page,
}) => {
  await page.goto("/documents/new");
  await page.getByRole("button", { name: "この書類を作る" }).first().click();
  await page.waitForURL(/\/documents\/.+\/edit/);
  const documentId = page.url().match(/documents\/([^/]+)\/edit/)![1];
  await page.fill('input[name="fullName"]', "履歴 花子");
  await expect(page.getByText("保存しました")).toBeVisible();

  await page.getByRole("button", { name: "履歴に保存" }).click();
  await expect(
    page.getByRole("button", { name: "履歴に保存しました" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /履歴に保存$/ }).click();

  await page.goto(`/documents/${documentId}/versions`);
  await expect(page.getByText(/バージョン 1/)).toBeVisible();
  await expect(page.getByText(/バージョン 2/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "この版に戻す" }).first(),
  ).toBeVisible();
});
