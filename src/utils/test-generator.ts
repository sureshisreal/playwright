import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

/**
 * Test generator utility to minimize code duplication and speed up test authoring
 */
export class TestGenerator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Generate a basic UI test template
   */
  generateUITest(pageName: string, testName: string): string {
    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${pageName} Tests', () => {
  test('${testName}', async ({ page, allureHelper, screenshotHelper }) => {
    await allureHelper.addDescription('${testName}');
    await allureHelper.addTags(['ui', '${pageName.toLowerCase()}']);
    
    await allureHelper.addStep('Navigate to ${pageName}', async () => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle(/.*${pageName}.*/);
    });

    await allureHelper.addStep('Take screenshot', async () => {
      await screenshotHelper.takeScreenshot('${pageName}-loaded');
    });
  });
});`;
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
}

export const testGenerator = new TestGenerator();