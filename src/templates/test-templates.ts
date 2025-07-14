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
    validations?: Array<{
      field: string;
      expected: any;
    }>;
  }): string {
    const validationSteps = config.validations?.map(validation => `
      expect(data.${validation.field}).toBe(${JSON.stringify(validation.expected)});`).join('') || '';

    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.testName} API Tests', () => {
  test('should ${config.method.toLowerCase()} ${config.endpoint}', async ({ apiClient, allureHelper }) => {
    await allureHelper.addDescription('${config.testName} API endpoint test');
    await allureHelper.addTags(['api', '${config.method.toLowerCase()}']);

    await allureHelper.addStep('Send ${config.method} request', async () => {
      const response = await apiClient.${config.method.toLowerCase()}('${config.endpoint}'${config.payload ? `, ${JSON.stringify(config.payload)}` : ''});
      expect(response.status()).toBe(${config.expectedStatus || 200});
      
      const data = await response.json();${validationSteps}
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
    interactions: Array<{
      type: 'tap' | 'swipe' | 'pinch' | 'rotate';
      selector?: string;
      direction?: string;
    }>;
  }): string {
    const deviceTests = config.devices.map(device => {
      const interactionSteps = config.interactions.map(interaction => {
        switch (interaction.type) {
          case 'tap':
            return `await mobileHelper.testTouchInteractions('${interaction.selector}');`;
          case 'swipe':
            return `await mobileHelper.testSwipeGestures('${interaction.direction}');`;
          case 'pinch':
            return `await mobileHelper.testPinchZoom();`;
          case 'rotate':
            return `await mobileHelper.testDeviceOrientation();`;
          default:
            return '';
        }
      }).join('\n      ');

      return `
  test('should work on ${device}', async ({ page, mobileHelper, allureHelper }) => {
    await allureHelper.addDescription('${config.testName} on ${device}');
    await allureHelper.addTags(['mobile', '${device.toLowerCase().replace(/\s+/g, '-')}']);

    await allureHelper.addStep('Set up ${device}', async () => {
      await mobileHelper.setDevice('${device}');
      await page.goto('${config.url}');
    });

    await allureHelper.addStep('Test mobile interactions', async () => {
      ${interactionSteps}
    });
  });`;
    }).join('');

    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.testName} Mobile Tests', () => {${deviceTests}
});`;
  }

  /**
   * Generate accessibility test with minimal code
   */
  static generateAccessibilityTest(config: {
    testName: string;
    url: string;
    checks: Array<'scan' | 'contrast' | 'keyboard' | 'aria' | 'forms' | 'images' | 'headings'>;
  }): string {
    const checkSteps = config.checks.map(check => {
      switch (check) {
        case 'scan':
          return `
    await allureHelper.addStep('Run accessibility scan', async () => {
      const results = await accessibilityHelper.runAccessibilityScan();
      expect(results.violations).toHaveLength(0);
    });`;
        case 'contrast':
          return `
    await allureHelper.addStep('Check color contrast', async () => {
      const violations = await accessibilityHelper.checkColorContrast();
      expect(violations).toHaveLength(0);
    });`;
        case 'keyboard':
          return `
    await allureHelper.addStep('Check keyboard navigation', async () => {
      const violations = await accessibilityHelper.checkKeyboardNavigation();
      expect(violations).toHaveLength(0);
    });`;
        case 'aria':
          return `
    await allureHelper.addStep('Check ARIA attributes', async () => {
      const violations = await accessibilityHelper.checkAriaAttributes();
      expect(violations).toHaveLength(0);
    });`;
        case 'forms':
          return `
    await allureHelper.addStep('Check form labels', async () => {
      const violations = await accessibilityHelper.checkFormLabels();
      expect(violations).toHaveLength(0);
    });`;
        case 'images':
          return `
    await allureHelper.addStep('Check image alt text', async () => {
      const violations = await accessibilityHelper.checkImageAltText();
      expect(violations).toHaveLength(0);
    });`;
        case 'headings':
          return `
    await allureHelper.addStep('Check heading structure', async () => {
      const violations = await accessibilityHelper.checkHeadingStructure();
      expect(violations).toHaveLength(0);
    });`;
        default:
          return '';
      }
    }).join('');

    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.testName} Accessibility Tests', () => {
  test('should meet accessibility standards', async ({ page, accessibilityHelper, allureHelper }) => {
    await allureHelper.addDescription('${config.testName} accessibility compliance test');
    await allureHelper.addTags(['accessibility', 'a11y']);

    await allureHelper.addStep('Navigate to page', async () => {
      await page.goto('${config.url}');
    });
    ${checkSteps}
  });
});`;
  }

  /**
   * Generate performance test with minimal code
   */
  static generatePerformanceTest(config: {
    testName: string;
    url: string;
    thresholds: {
      loadTime?: number;
      fcp?: number;
      lcp?: number;
      cls?: number;
      tti?: number;
    };
  }): string {
    const thresholdChecks = Object.entries(config.thresholds).map(([metric, threshold]) => {
      return `expect(metrics.${metric}).toBeLessThan(${threshold});`;
    }).join('\n      ');

    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.testName} Performance Tests', () => {
  test('should meet performance thresholds', async ({ page, performanceHelper, allureHelper }) => {
    await allureHelper.addDescription('${config.testName} performance test');
    await allureHelper.addTags(['performance', 'metrics']);

    await allureHelper.addStep('Start performance monitoring', async () => {
      await performanceHelper.startPerformanceMonitoring();
    });

    await allureHelper.addStep('Load page and measure', async () => {
      await page.goto('${config.url}');
      const metrics = await performanceHelper.getPerformanceMetrics();
      
      ${thresholdChecks}
    });
  });
});`;
  }
}