/**
 * Optimized test templates to reduce authoring time
 */
export class TestTemplates {
  /**
   * Generate UI test with minimal code
   */
  static generateUITest(config: {
    testName: string;
    url: string;
    title: string;
    interactions: Array<{
      action: 'click' | 'fill' | 'select' | 'check';
      selector: string;
      value?: string;
      expected?: string;
    }>;
  }): string {
    const interactionSteps = config.interactions.map(interaction => {
      switch (interaction.action) {
        case 'click':
          return `
    await allureHelper.addStep('Click ${interaction.selector}', async () => {
      await page.click('${interaction.selector}');
      ${interaction.expected ? `await expect(page.locator('${interaction.expected}')).toBeVisible();` : ''}
    });`;
        case 'fill':
          return `
    await allureHelper.addStep('Fill ${interaction.selector}', async () => {
      await page.fill('${interaction.selector}', '${interaction.value}');
    });`;
        case 'select':
          return `
    await allureHelper.addStep('Select ${interaction.selector}', async () => {
      await page.selectOption('${interaction.selector}', '${interaction.value}');
    });`;
        case 'check':
          return `
    await allureHelper.addStep('Check ${interaction.selector}', async () => {
      await page.check('${interaction.selector}');
    });`;
        default:
          return '';
      }
    }).join('');

    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.testName} Tests', () => {
  test('${config.testName}', async ({ page, allureHelper, screenshotHelper }) => {
    await allureHelper.addDescription('${config.testName} functionality test');
    await allureHelper.addTags(['ui', 'automated']);

    await allureHelper.addStep('Navigate and verify page', async () => {
      await page.goto('${config.url}');
      await expect(page).toHaveTitle(/${config.title}/i);
    });
    ${interactionSteps}

    await allureHelper.addStep('Take final screenshot', async () => {
      await screenshotHelper.takeScreenshot('${config.testName.toLowerCase().replace(/\s+/g, '-')}-final');
    });
  });
});`;
  }

  /**
   * Generate API test with minimal code
   */
  static generateAPITest(config: {
    testName: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    payload?: any;
    expectedStatus?: number;
  }): string {
    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.testName} API Tests', () => {
  test('should ${config.method.toLowerCase()} ${config.endpoint}', async ({ apiClient, allureHelper }) => {
    await allureHelper.addDescription('${config.testName} API endpoint test');
    await allureHelper.addTags(['api', '${config.method.toLowerCase()}']);

    await allureHelper.addStep('Send ${config.method} request', async () => {
      const response = await apiClient.${config.method.toLowerCase()}('${config.endpoint}'${config.payload ? `, ${JSON.stringify(config.payload)}` : ''});
      expect(response.status()).toBe(${config.expectedStatus || 200});
      
      const data = await response.json();
      expect(data).toBeDefined();
    });
  });
});`;
  }

  /**
   * Generate mobile test with minimal code
   */
  static generateMobileTest(config: {
    testName: string;
    url: string;
    devices: string[];
  }): string {
    const deviceTests = config.devices.map(device => `
  test('should work on ${device}', async ({ page, mobileHelper, allureHelper }) => {
    await allureHelper.addDescription('${config.testName} on ${device}');
    await allureHelper.addTags(['mobile', '${device.toLowerCase().replace(/\s+/g, '-')}']);

    await allureHelper.addStep('Set up ${device}', async () => {
      await mobileHelper.setDevice('${device}');
      await page.goto('${config.url}');
    });

    await allureHelper.addStep('Test mobile interactions', async () => {
      const touchResult = await mobileHelper.testTouchInteractions('[data-test="button"]');
      expect(touchResult.tap).toBe(true);
    });
  });`).join('');

    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.testName} Mobile Tests', () => {${deviceTests}
});`;
  }
}