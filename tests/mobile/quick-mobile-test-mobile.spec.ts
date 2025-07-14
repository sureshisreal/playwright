import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('Quick Mobile Test Mobile Tests', () => {
  test('should work on iPhone 13', async ({ page, mobileHelper, allureHelper }) => {
    await allureHelper.addDescription('Quick Mobile Test on mobile device');
    await allureHelper.addTags(['mobile', 'iphone-13']);

    await allureHelper.addStep('Set up mobile device', async () => {
      await mobileHelper.setDevice('iPhone 13');
      await page.goto('https://example.com');
    });

    await allureHelper.addStep('Test touch interactions', async () => {
      const touchResult = await mobileHelper.testTouchInteractions('[data-test="button"]');
      expect(touchResult.tap).toBe(true);
    });
  });
});