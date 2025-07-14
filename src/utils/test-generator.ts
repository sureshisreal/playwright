import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

/**
 * Test generator utility to minimize code duplication and speed up test authoring
 */
export class TestGenerator {
  private logger: Logger;
  private templatesDir: string;

  constructor() {
    this.logger = new Logger();
    this.templatesDir = 'src/templates';
    this.ensureTemplatesDir();
  }

  private ensureTemplatesDir(): void {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  /**
   * Generate a basic UI test template
   */
  generateUITest(pageName: string, testName: string): string {
    const template = `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${pageName} Tests', () => {
  test('${testName}', async ({ page, examplePage, allureHelper, screenshotHelper }) => {
    await allureHelper.addDescription('${testName}');
    await allureHelper.addTags(['ui', '${pageName.toLowerCase()}']);
    
    await allureHelper.addStep('Navigate to ${pageName}', async () => {
      await examplePage.navigate();
    });

    await allureHelper.addStep('Verify page loaded', async () => {
      await expect(page).toHaveTitle(/.*${pageName}.*/);
    });

    await allureHelper.addStep('Take screenshot', async () => {
      await screenshotHelper.takeScreenshot('${pageName}-loaded');
    });
    
    // Add your test steps here
  });
});`;
    return template;
  }

  /**
   * Generate API test template
   */
  generateAPITest(endpoint: string, method: string): string {
    const template = `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${endpoint} API Tests', () => {
  test('should ${method.toLowerCase()} ${endpoint}', async ({ apiClient, allureHelper }) => {
    await allureHelper.addDescription('Test ${method} ${endpoint} endpoint');
    await allureHelper.addTags(['api', '${endpoint.toLowerCase()}']);
    
    await allureHelper.addStep('Send ${method} request', async () => {
      const response = await apiClient.${method.toLowerCase()}('${endpoint}');
      expect(response.status).toBe(200);
    });
    
    // Add your API test steps here
  });
});`;
    return template;
  }

  /**
   * Generate mobile test template
   */
  generateMobileTest(feature: string): string {
    const template = `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('Mobile ${feature} Tests', () => {
  test('should test ${feature} on mobile', async ({ page, mobileHelper, allureHelper }) => {
    await allureHelper.addDescription('Test ${feature} on mobile devices');
    await allureHelper.addTags(['mobile', '${feature.toLowerCase()}']);
    
    await allureHelper.addStep('Set mobile device', async () => {
      await mobileHelper.setDevice('iPhone 13');
    });

    await allureHelper.addStep('Navigate to page', async () => {
      await page.goto('https://example.com');
    });

    await allureHelper.addStep('Test touch interactions', async () => {
      const touchResults = await mobileHelper.testTouchInteractions('button');
      expect(touchResults.tap).toBe(true);
    });
    
    // Add your mobile test steps here
  });
});`;
    return template;
  }

  /**
   * Generate accessibility test template
   */
  generateAccessibilityTest(pageName: string): string {
    const template = `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${pageName} Accessibility Tests', () => {
  test('should pass accessibility scan', async ({ page, accessibilityHelper, allureHelper }) => {
    await allureHelper.addDescription('Test accessibility compliance for ${pageName}');
    await allureHelper.addTags(['accessibility', '${pageName.toLowerCase()}']);
    
    await allureHelper.addStep('Navigate to ${pageName}', async () => {
      await page.goto('https://example.com');
    });

    await allureHelper.addStep('Run accessibility scan', async () => {
      const results = await accessibilityHelper.runAccessibilityScan();
      expect(results.violations).toHaveLength(0);
    });
    
    // Add your accessibility test steps here
  });
});`;
    return template;
  }

  /**
   * Generate performance test template
   */
  generatePerformanceTest(pageName: string): string {
    const template = `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${pageName} Performance Tests', () => {
  test('should meet performance thresholds', async ({ page, performanceHelper, allureHelper }) => {
    await allureHelper.addDescription('Test performance metrics for ${pageName}');
    await allureHelper.addTags(['performance', '${pageName.toLowerCase()}']);
    
    await allureHelper.addStep('Start performance monitoring', async () => {
      await performanceHelper.startPerformanceMonitoring();
    });

    await allureHelper.addStep('Navigate to ${pageName}', async () => {
      await page.goto('https://example.com');
    });

    await allureHelper.addStep('Measure performance', async () => {
      const metrics = await performanceHelper.getPerformanceMetrics();
      expect(metrics.loadTime).toBeLessThan(3000);
    });
    
    // Add your performance test steps here
  });
});`;
    return template;
  }

  /**
   * Create test file from template
   */
  createTestFile(testType: string, params: any): string {
    let content = '';
    const fileName = `${params.name || 'test'}-${testType}.spec.ts`;
    
    switch (testType) {
      case 'ui':
        content = this.generateUITest(params.pageName, params.testName);
        break;
      case 'api':
        content = this.generateAPITest(params.endpoint, params.method);
        break;
      case 'mobile':
        content = this.generateMobileTest(params.feature);
        break;
      case 'accessibility':
        content = this.generateAccessibilityTest(params.pageName);
        break;
      case 'performance':
        content = this.generatePerformanceTest(params.pageName);
        break;
      default:
        throw new Error(`Unknown test type: ${testType}`);
    }
    
    const filePath = path.join('tests', testType, fileName);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    this.logger.info(`Generated test file: ${filePath}`);
    
    return filePath;
  }

  /**
   * Get available webpage methods and selectors
   */
  getWebpageMethodsReference(): string {
    return `
# 🔧 Available Webpage Methods and Selectors

## Page Navigation Methods
- \`page.goto(url)\` - Navigate to URL
- \`page.goBack()\` - Navigate back
- \`page.goForward()\` - Navigate forward
- \`page.reload()\` - Reload page
- \`page.waitForURL(url)\` - Wait for URL change

## Element Interaction Methods
- \`page.click(selector)\` - Click element
- \`page.dblclick(selector)\` - Double click element
- \`page.fill(selector, text)\` - Fill input field
- \`page.type(selector, text)\` - Type text slowly
- \`page.press(selector, key)\` - Press key
- \`page.hover(selector)\` - Hover over element
- \`page.focus(selector)\` - Focus element
- \`page.blur(selector)\` - Remove focus
- \`page.check(selector)\` - Check checkbox/radio
- \`page.uncheck(selector)\` - Uncheck checkbox
- \`page.selectOption(selector, value)\` - Select dropdown option
- \`page.setInputFiles(selector, files)\` - Upload files

## Element Query Methods
- \`page.locator(selector)\` - Get element locator
- \`page.$(selector)\` - Get element handle
- \`page.$$(selector)\` - Get all element handles
- \`page.textContent(selector)\` - Get text content
- \`page.innerHTML(selector)\` - Get inner HTML
- \`page.getAttribute(selector, name)\` - Get attribute value
- \`page.isVisible(selector)\` - Check if visible
- \`page.isHidden(selector)\` - Check if hidden
- \`page.isEnabled(selector)\` - Check if enabled
- \`page.isDisabled(selector)\` - Check if disabled
- \`page.isChecked(selector)\` - Check if checked

## Wait Methods
- \`page.waitForSelector(selector)\` - Wait for element
- \`page.waitForTimeout(timeout)\` - Wait for time
- \`page.waitForFunction(fn)\` - Wait for function
- \`page.waitForEvent(event)\` - Wait for event
- \`page.waitForLoadState(state)\` - Wait for load state
- \`page.waitForResponse(url)\` - Wait for response

## Mobile-Specific Methods
- \`page.tap(selector)\` - Touch tap
- \`page.swipe(from, to)\` - Swipe gesture
- \`page.pinch(center, scale)\` - Pinch zoom
- \`page.rotate()\` - Rotate device
- \`page.setViewportSize(size)\` - Set viewport

## Common Selectors
- \`'text=Button'\` - Text content
- \`'data-test=submit'\` - Data attribute
- \`'#id'\` - ID selector
- \`'.class'\` - Class selector
- \`'[placeholder="Search"]'\` - Attribute selector
- \`'button:has-text("Submit")'\` - Has text
- \`'div >> text=Content'\` - Child combinator
- \`'input:nth-child(2)'\` - Nth child
- \`'button:visible'\` - Visible elements
- \`'input:enabled'\` - Enabled elements

## Assertions (expect)
- \`expect(page).toHaveTitle(title)\` - Check page title
- \`expect(page).toHaveURL(url)\` - Check URL
- \`expect(locator).toBeVisible()\` - Check visibility
- \`expect(locator).toBeHidden()\` - Check hidden
- \`expect(locator).toBeEnabled()\` - Check enabled
- \`expect(locator).toBeDisabled()\` - Check disabled
- \`expect(locator).toBeChecked()\` - Check checked state
- \`expect(locator).toHaveText(text)\` - Check text content
- \`expect(locator).toHaveValue(value)\` - Check input value
- \`expect(locator).toHaveAttribute(name, value)\` - Check attribute
- \`expect(locator).toHaveClass(className)\` - Check class
- \`expect(locator).toHaveCount(count)\` - Check element count

## Framework-Specific Helpers
- \`allureHelper.addStep(name, fn)\` - Add test step
- \`allureHelper.addDescription(desc)\` - Add description
- \`allureHelper.addTags(tags)\` - Add tags
- \`screenshotHelper.takeScreenshot(name)\` - Take screenshot
- \`mobileHelper.setDevice(device)\` - Set mobile device
- \`accessibilityHelper.runAccessibilityScan()\` - Run a11y scan
- \`performanceHelper.getPerformanceMetrics()\` - Get performance data
- \`apiClient.get(url)\` - Make GET request
- \`apiClient.post(url, data)\` - Make POST request
- \`testData.generateUser()\` - Generate test data
- \`logger.info(message)\` - Log information

## Best Practices
1. Use data-test attributes for reliable selectors
2. Prefer text selectors for user-facing elements
3. Use waitForSelector before interactions
4. Add meaningful step descriptions
5. Take screenshots for visual verification
6. Use page object pattern for complex pages
7. Group related tests in describe blocks
8. Use appropriate timeouts for slow operations
9. Handle async operations properly
10. Use meaningful test and variable names
`;
  }

  /**
   * Generate optimized test suite
   */
  generateOptimizedTestSuite(suiteName: string, testCases: any[]): string {
    const template = `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${suiteName}', () => {
  // Shared setup for all tests in suite
  test.beforeEach(async ({ page, allureHelper }) => {
    await allureHelper.addTags(['${suiteName.toLowerCase()}']);
    await page.goto('https://example.com');
  });

  ${testCases.map(testCase => `
  test('${testCase.name}', async ({ page, allureHelper, screenshotHelper }) => {
    await allureHelper.addDescription('${testCase.description}');
    
    ${testCase.steps.map((step, index) => `
    await allureHelper.addStep('${step.name}', async () => {
      ${step.action}
    });`).join('')}
    
    await screenshotHelper.takeScreenshot('${testCase.name.toLowerCase().replace(/\s+/g, '-')}');
  });`).join('')}
});`;
    return template;
  }
}

export const testGenerator = new TestGenerator();