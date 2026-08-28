const { test, expect } = require('@playwright/test');

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  return errors;
}

async function startAssessment(page, mode) {
  await page.goto('/');
  const label = mode === 'deep' ? 'Begin Deeper Discernment' : 'Begin Formation Assessment';
  await page.getByRole('link', { name: label }).click();
  await expect(page).toHaveURL(new RegExp(`scale\\.html\\?mode=${mode}`));
  await expect(page.getByRole('heading', { name: 'How to use the response scale.' })).toBeVisible();
  await page.getByRole('link', { name: label }).click();
  await expect(page).toHaveURL(new RegExp(`pilot-v4\\.html\\?mode=${mode}`));
}

async function answerUntilPreProfile(page, max = 112) {
  let answered = 0;
  while (await page.locator('#pre').isHidden()) {
    answered += 1;
    expect(answered).toBeLessThanOrEqual(max);
    await expect(page.locator('#count')).toHaveText(`Question ${answered}`);
    await page.getByLabel('Somewhat true', { exact: true }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  return answered;
}

for (const mode of ['quick', 'deep']) {
  test(`${mode} V4 assessment completes through canonical FormationResult`, async ({ page }) => {
    const errors = watchErrors(page);
    await startAssessment(page, mode);
    await expect(page.locator('.brand')).toHaveText('FORMATION');
    await expect(page.locator('#assess .hero')).toBeVisible();

    const answered = await answerUntilPreProfile(page);
    if (mode === 'quick') expect(answered).toBe(56);
    else expect(answered).toBeGreaterThanOrEqual(84);

    await expect(page.locator('#pre')).toBeVisible();
    await page.getByLabel('In personal prayer or quiet time with God', { exact: true }).check();
    await page.getByLabel('Busyness, hurry or an overloaded schedule', { exact: true }).check();
    await page.getByLabel('My current season significantly limits how much control I have over my time.', { exact: true }).check();
    await page.getByPlaceholder('I sense God may be inviting me to…').fill('Receive a less hurried rhythm in ordinary life.');
    await page.getByRole('button', { name: 'See my Formation Profile' }).click();

    await expect(page.locator('#prof')).toBeVisible();
    await expect(page.locator('#domains .domain')).toHaveCount(14);
    await expect(page.locator('#areas .area')).toHaveCount(3);
    await expect(page.locator('#anchor .role-explainer')).toBeVisible();
    await expect(page.locator('#attention .role-explainer')).toBeVisible();
    await expect(page.locator('#plan .week')).toHaveCount(4);
    await expect(page.locator('#res a').first()).toHaveAttribute('href', /^https:\/\//);

    const contract = await page.evaluate(() => ({
      version: window.FormationCurrentResult?.version,
      domainCount: window.FormationCurrentResult?.domains?.length,
      areaCount: window.FormationCurrentResult?.areas?.length,
      hasPlan: !!window.FormationCurrentResult?.plan,
      hasContext: Array.isArray(window.FormationCurrentResult?.context?.constraints),
      adaptive: window.FormationCurrentResult?.diagnostics?.adaptive || false,
    }));
    expect(contract.version).toBe('4.0');
    expect(contract.domainCount).toBe(14);
    expect(contract.areaCount).toBe(3);
    expect(contract.hasPlan).toBe(true);
    expect(contract.hasContext).toBe(true);
    if (mode === 'deep') expect(contract.adaptive).toBe(true);

    await expect(page.getByRole('button', { name: 'Share with a mentor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share with a peer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download one-page PDF' })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test('question flow keeps Formation visible and hides the description after question one', async ({ page }) => {
  const errors = watchErrors(page);
  await startAssessment(page, 'quick');
  await expect(page.locator('#count')).toHaveText('Question 1');
  await expect(page.locator('#dn')).toHaveText('Prayer');
  await expect(page.locator('#assess .hero')).toBeVisible();
  await page.getByLabel('Mostly true', { exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#count')).toHaveText('Question 2');
  await expect(page.locator('#dn')).toHaveText('Prayer');
  await expect(page.locator('.brand')).toHaveText('FORMATION');
  await expect(page.locator('#assess .hero')).toBeHidden();
  expect(errors).toEqual([]);
});

test('Back returns to scale on question 1 and restores saved answers', async ({ page }) => {
  const errors = watchErrors(page);
  await startAssessment(page, 'quick');
  await page.getByRole('button', { name: 'Back to scale' }).click();
  await expect(page).toHaveURL(/scale\.html\?mode=quick/);
  await page.getByRole('link', { name: 'Begin Formation Assessment' }).click();
  await page.getByLabel('Mostly true', { exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel('Slightly true', { exact: true }).check();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Mostly true', { exact: true })).toBeChecked();
  await expect(page.locator('#count')).toHaveText('Question 1');
  expect(errors).toEqual([]);
});

test('all four development routes remain available', async ({ page }) => {
  await page.goto('/development.html');
  await expect(page.getByRole('link', { name: 'Open full experience' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open algorithm harness' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open post-assessment sample' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open stress tests' })).toBeVisible();
});

test('sample profile still opens after V4 foundation refactor', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/sample.html');
  await page.getByRole('button', { name: 'See sample Formation Profile' }).click();
  await expect(page.locator('#domains .domain')).toHaveCount(14);
  await expect(page.locator('#areas .area')).toHaveCount(3);
  expect(errors).toEqual([]);
});
