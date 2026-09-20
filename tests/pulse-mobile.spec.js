const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 320, height: 568 } });

test('pulse opens at the top and every question fits the mobile viewport', async ({ page }) => {
  await page.goto('/pulse.html');
  await page.evaluate(() => {
    scrollTo(0, document.documentElement.scrollHeight);
    start();
  });

  for (let question = 1; question <= 17; question += 1) {
    await expect(page.locator('#count')).toHaveText(`${question} of 17`);
    await page.waitForFunction(() => window.scrollY === 0);

    const layout = await page.evaluate(() => {
      const assess = document.querySelector('#assess');
      const card = assess.querySelector('.card').getBoundingClientRect();
      const intro = assess.querySelector('.hero').getBoundingClientRect();
      return {
        scrollY: window.scrollY,
        introTop: intro.top,
        cardBottom: card.bottom,
        viewportHeight: window.innerHeight,
      };
    });

    expect(layout.scrollY).toBe(0);
    expect(layout.introTop).toBeGreaterThanOrEqual(0);
    expect(layout.cardBottom).toBeLessThanOrEqual(layout.viewportHeight);

    await page.locator('#scale button').nth(2).click();
  }

  await expect(page.locator('#season')).toBeVisible();
});
