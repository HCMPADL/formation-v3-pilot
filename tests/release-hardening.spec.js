const { test, expect } = require("@playwright/test");

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function startAssessment(page, mode) {
  await page.goto("/");
  const label =
    mode === "deep"
      ? "Begin In-Depth Assessment"
      : "Begin Formation Assessment";
  await page.getByRole("link", { name: label }).click();
  await expect(page).toHaveURL(new RegExp(`scale\\.html\\?mode=${mode}`));
  await expect(page.getByRole("heading", { name: "How to use the response scale." })).toBeVisible();
  await page.getByRole("link", { name: "Begin assessment" }).click();
  await expect(page).toHaveURL(new RegExp(`pilot-readable\\.html\\?mode=${mode}`));
}

async function answerAll(page, total) {
  for (let question = 1; question <= total; question++) {
    await expect(page.locator("#count")).toHaveText(
      `Question ${question} of ${total}`,
    );
    await page.getByLabel("Somewhat true", { exact: true }).check();
    await page
      .getByRole("button", {
        name: question === total ? "Continue" : "Next",
        exact: true,
      })
      .click();
  }
}

for (const mode of ["quick", "deep"]) {
  const total = mode === "deep" ? 112 : 56;
  test(`${total}-question assessment completes through profile, sharing and print`, async ({
    page,
    browserName,
  }) => {
    const errors = watchErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__formationCopiedText = text;
          },
          readText: async () => window.__formationCopiedText || "",
        },
      });
    });
    await startAssessment(page, mode);
    await answerAll(page, total);

    await expect(page.locator("#pre")).toBeVisible();
    await page
      .getByLabel("In personal prayer or quiet time with God", { exact: true })
      .check();
    await page
      .getByLabel("Busyness, hurry or an overloaded schedule", { exact: true })
      .check();
    await page
      .getByPlaceholder("I sense God may be inviting me to…")
      .fill("Receive a less hurried rhythm in ordinary life.");
    await page
      .getByRole("button", { name: "See my Formation Profile" })
      .click();

    await expect(page.locator("#prof")).toBeVisible();
    await expect(page.locator("#domains .domain")).toHaveCount(14);
    await expect(page.locator("#areas .area")).toHaveCount(3);
    await expect(page.locator("#anchor")).not.toBeEmpty();
    await expect(page.locator("#attention")).not.toBeEmpty();
    await expect(page.locator("#printSummary .print-row")).toHaveCount(17);

    const resources = page.locator("#res a");
    expect(await resources.count()).toBeGreaterThan(0);
    for (const link of await resources.all()) {
      await expect(link).toHaveAttribute("href", /^https:\/\//);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }

    await page.getByRole("button", { name: "Copy profile summary" }).click();
    await expect(page.locator("#shareStatus")).toHaveText(
      "Profile summary copied.",
    );
    await expect.poll(() => page.evaluate(() => window.__formationCopiedText)).toContain("FORMATION PROFILE");

    await page.evaluate(() => {
      window.print = () => document.documentElement.setAttribute("data-printed", "true");
    });
    await page.getByRole("button", { name: "Print / save as PDF" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-printed", "true");
    await expect(page.locator("#shareStatus")).toContainText("printable one-page profile");
    if (browserName === "chromium") {
      const pdf = await page.pdf({ format: "A4", printBackground: true });
      const pages = pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? [];
      expect(pages).toHaveLength(1);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("Back returns to scale on question 1 and restores saved answers later", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await startAssessment(page, "quick");
  await page.getByRole("button", { name: "Back to scale" }).click();
  await expect(page).toHaveURL(/scale\.html\?mode=quick/);

  await page.getByRole("link", { name: "Begin assessment" }).click();
  await page.getByLabel("Mostly true", { exact: true }).check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Slightly true", { exact: true }).check();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Mostly true", { exact: true })).toBeChecked();
  await expect(page.locator("#count")).toHaveText("Question 1 of 56");

  const cardPosition = await page.locator("#assess .card").boundingBox();
  const viewport = page.viewportSize();
  expect(cardPosition).not.toBeNull();
  expect(cardPosition.y).toBeLessThan(viewport.height);
  expect(errors).toEqual([]);
});

test("all four development routes are local and functional", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/development.html");
  const routes = [
    ["Open full experience", "/index.html"],
    ["Open algorithm harness", "/algorithm.html#sim"],
    ["Open post-assessment sample", "/sample.html"],
    ["Open stress tests", "/algorithm.html#stress"],
  ];
  for (const [name, suffix] of routes) {
    const href = await page.getByRole("link", { name }).getAttribute("href");
    expect(href).toBe(`.${suffix}`);
  }

  await page.getByRole("link", { name: "Open algorithm harness" }).click();
  await expect(page.locator("#sim")).toBeVisible();
  await page.getByRole("button", { name: "Make Room" }).click();
  await expect(page.locator("#modeOut")).toHaveText("112");

  await page.goto("/algorithm.html#stress");
  await expect(page.locator("#stress")).toBeVisible();
  await expect(page.locator("#stressSummary")).toHaveText(
    "8 of 8 deterministic checks passed.",
  );
  await expect(page.locator(".stress .fail")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("sample profile, share controls and resource destinations render", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => {
    window.__formationShares = [];
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (payload) => window.__formationShares.push(payload),
    });
  });
  await page.goto("/sample.html");
  await page
    .getByRole("button", { name: "See sample Formation Profile" })
    .click();
  await expect(page.locator("#domains .domain")).toHaveCount(14);
  await expect(page.locator("#areas .area")).toHaveCount(3);
  const resources = page.locator(".resgrid a");
  await expect(resources).toHaveCount(3);
  for (const link of await resources.all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\//);
    await expect(link).toHaveAttribute("target", "_blank");
  }
  await expect(page.getByRole("button", { name: "Share with leader" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Share with peer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print / save PDF" })).toBeVisible();
  await page.getByRole("button", { name: "Share with leader" }).click();
  await page.getByRole("button", { name: "Share with peer" }).click();
  await expect.poll(() => page.evaluate(() => window.__formationShares.length)).toBe(2);
  await page.evaluate(() => {
    window.print = () => document.documentElement.setAttribute("data-printed", "true");
  });
  await page.getByRole("button", { name: "Print / save PDF" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "true");
  expect(errors).toEqual([]);
});
