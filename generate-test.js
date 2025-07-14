#!/usr/bin/env node

/**
 * Quick test generator CLI
 * Usage: node generate-test.js --type ui --name "Login Test" --url "https://example.com/login"
 */

const fs = require('fs');
const path = require('path');

class QuickTestGenerator {
  static generateQuickTest(config) {
    const fileName = `${config.name.toLowerCase().replace(/\s+/g, '-')}-${config.type}.spec.ts`;
    const testDir = path.join('tests', config.type);
    const filePath = path.join(testDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    let testContent = '';

    switch (config.type) {
      case 'ui':
        testContent = this.generateUITest(config);
        break;
      case 'api':
        testContent = this.generateAPITest(config);
        break;
      case 'mobile':
        testContent = this.generateMobileTest(config);
        break;
      case 'accessibility':
        testContent = this.generateA11yTest(config);
        break;
      case 'performance':
        testContent = this.generatePerfTest(config);
        break;
      default:
        throw new Error(`Unknown test type: ${config.type}`);
    }

    // Write test file
    fs.writeFileSync(filePath, testContent);
    
    return filePath;
  }

  static generateUITest(config) {
    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.name} Tests', () => {
  test('${config.name}', async ({ page, allureHelper, screenshotHelper }) => {
    await allureHelper.addDescription('${config.name} functionality test');
    await allureHelper.addTags(['ui', 'automated']);

    await allureHelper.addStep('Navigate and verify page', async () => {
      await page.goto('${config.url || 'https://example.com'}');
      await expect(page).toHaveTitle(/${config.name}/i);
    });

    await allureHelper.addStep('Test interaction', async () => {
      await page.click('[data-test="button"]');
      await expect(page.locator('[data-test="result"]')).toBeVisible();
    });

    await allureHelper.addStep('Take screenshot', async () => {
      await screenshotHelper.takeScreenshot('${config.name.toLowerCase().replace(/\s+/g, '-')}-final');
    });
  });
});`;
  }

  static generateAPITest(config) {
    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.name} API Tests', () => {
  test('should ${config.method || 'GET'} ${config.endpoint || '/api/test'}', async ({ apiClient, allureHelper }) => {
    await allureHelper.addDescription('${config.name} API endpoint test');
    await allureHelper.addTags(['api', '${config.method || 'get'}']);

    await allureHelper.addStep('Send ${config.method || 'GET'} request', async () => {
      const response = await apiClient.${(config.method || 'GET').toLowerCase()}('${config.endpoint || '/api/test'}');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeDefined();
    });
  });
});`;
  }

  static generateMobileTest(config) {
    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.name} Mobile Tests', () => {
  test('should work on ${config.device || 'iPhone 13'}', async ({ page, mobileHelper, allureHelper }) => {
    await allureHelper.addDescription('${config.name} on mobile device');
    await allureHelper.addTags(['mobile', '${(config.device || 'iPhone 13').toLowerCase().replace(/\s+/g, '-')}']);

    await allureHelper.addStep('Set up mobile device', async () => {
      await mobileHelper.setDevice('${config.device || 'iPhone 13'}');
      await page.goto('${config.url || 'https://example.com'}');
    });

    await allureHelper.addStep('Test touch interactions', async () => {
      const touchResult = await mobileHelper.testTouchInteractions('[data-test="button"]');
      expect(touchResult.tap).toBe(true);
    });
  });
});`;
  }

  static generateA11yTest(config) {
    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.name} Accessibility Tests', () => {
  test('should meet accessibility standards', async ({ page, accessibilityHelper, allureHelper }) => {
    await allureHelper.addDescription('${config.name} accessibility compliance test');
    await allureHelper.addTags(['accessibility', 'a11y']);

    await allureHelper.addStep('Navigate to page', async () => {
      await page.goto('${config.url || 'https://example.com'}');
    });

    await allureHelper.addStep('Run accessibility scan', async () => {
      const results = await accessibilityHelper.runAccessibilityScan();
      expect(results.violations).toHaveLength(0);
    });
  });
});`;
  }

  static generatePerfTest(config) {
    return `import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('${config.name} Performance Tests', () => {
  test('should meet performance thresholds', async ({ page, performanceHelper, allureHelper }) => {
    await allureHelper.addDescription('${config.name} performance test');
    await allureHelper.addTags(['performance', 'metrics']);

    await allureHelper.addStep('Start performance monitoring', async () => {
      await performanceHelper.startPerformanceMonitoring();
    });

    await allureHelper.addStep('Load page and measure', async () => {
      await page.goto('${config.url || 'https://example.com'}');
      const metrics = await performanceHelper.getPerformanceMetrics();
      
      expect(metrics.loadTime).toBeLessThan(3000);
      expect(metrics.firstContentfulPaint).toBeLessThan(1500);
    });
  });
});`;
  }

  static generateFromCLI(args) {
    const config = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];
      
      switch (arg) {
        case '--type':
          config.type = nextArg;
          i++;
          break;
        case '--name':
          config.name = nextArg;
          i++;
          break;
        case '--url':
          config.url = nextArg;
          i++;
          break;
        case '--endpoint':
          config.endpoint = nextArg;
          i++;
          break;
        case '--method':
          config.method = nextArg;
          i++;
          break;
        case '--device':
          config.device = nextArg;
          i++;
          break;
      }
    }

    if (!config.type || !config.name) {
      throw new Error('--type and --name are required');
    }

    return this.generateQuickTest(config);
  }
}

// Main execution
try {
  const filePath = QuickTestGenerator.generateFromCLI(process.argv.slice(2));
  console.log('✅ Test generated successfully:', filePath);
  console.log('');
  console.log('🚀 To run the test:');
  console.log('npx playwright test', filePath);
  console.log('');
  console.log('📊 To view results:');
  console.log('npx playwright show-report');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('');
  console.log('📖 Usage:');
  console.log('node generate-test.js --type <ui|api|mobile|accessibility|performance> --name "Test Name" [options]');
  console.log('');
  console.log('Options:');
  console.log('  --type      Test type (required)');
  console.log('  --name      Test name (required)');
  console.log('  --url       Target URL');
  console.log('  --endpoint  API endpoint');
  console.log('  --method    HTTP method');
  console.log('  --device    Mobile device');
  console.log('');
  console.log('Examples:');
  console.log('node generate-test.js --type ui --name "Login Test" --url "https://example.com/login"');
  console.log('node generate-test.js --type api --name "Users API" --endpoint "/api/users" --method GET');
  console.log('node generate-test.js --type mobile --name "Touch Test" --device "iPhone 13"');
  process.exit(1);
}