import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('Quick Demo Test Tests', () => {
  test('Quick Demo Test', async ({ page, allureHelper, screenshotHelper }) => {
    await allureHelper.addDescription('Quick Demo Test functionality test');
    await allureHelper.addTags(['ui', 'automated']);

    await allureHelper.addStep('Navigate and verify page', async () => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle(/Quick Demo Test/i);
    });

    await allureHelper.addStep('Test interaction', async () => {
      await page.click('[data-test="button"]');
      await expect(page.locator('[data-test="result"]')).toBeVisible();
    });

    await allureHelper.addStep('Take screenshot', async () => {
      await screenshotHelper.takeScreenshot('quick-demo-test-final');
    });
  });
});