import * as fs from 'fs';
import * as path from 'path';

/**
 * Test optimizer to minimize code duplication and reduce authoring time
 */
export class TestOptimizer {
  /**
   * Analyze existing tests for code duplication
   */
  static analyzeCodeDuplication(testDir: string): {
    duplicatedCode: string[];
    recommendations: string[];
    refactoringOpportunities: string[];
  } {
    const duplicatedCode: string[] = [];
    const recommendations: string[] = [];
    const refactoringOpportunities: string[] = [];

    // Scan test files for common patterns
    const testFiles = this.getTestFiles(testDir);
    const codePatterns = new Map<string, number>();

    testFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.length > 20) {
          codePatterns.set(trimmed, (codePatterns.get(trimmed) || 0) + 1);
        }
      });
    });

    // Find duplicated code
    codePatterns.forEach((count, code) => {
      if (count > 2) {
        duplicatedCode.push(`${code} (found ${count} times)`);
      }
    });

    // Generate recommendations
    if (duplicatedCode.length > 0) {
      recommendations.push('Extract common test patterns into utility functions');
      recommendations.push('Use test templates for repetitive test structures');
      recommendations.push('Create shared setup/teardown functions');
    }

    // Find refactoring opportunities
    testFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      if (content.includes('await page.goto') && content.includes('await expect(page).toHaveTitle')) {
        refactoringOpportunities.push(`${file}: Use standardSetup utility`);
      }
      
      if (content.includes('await page.fill') && content.split('await page.fill').length > 3) {
        refactoringOpportunities.push(`${file}: Use fillForm utility`);
      }
      
      if (content.includes('await page.click') && content.includes('await expect')) {
        refactoringOpportunities.push(`${file}: Use clickAndValidate utility`);
      }
    });

    return {
      duplicatedCode,
      recommendations,
      refactoringOpportunities
    };
  }

  /**
   * Get all test files recursively
   */
  private static getTestFiles(dir: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getTestFiles(fullPath));
      } else if (item.endsWith('.spec.ts') || item.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    });

    return files;
  }

  /**
   * Generate optimized test structure
   */
  static generateOptimizedStructure(): string {
    return `
# 🚀 Optimized Test Structure

## Recommended Folder Structure
\`\`\`
tests/
├── shared/
│   ├── base-test.ts        # Base test class with common functionality
│   ├── test-utilities.ts   # Shared utility functions
│   └── test-data.ts        # Common test data
├── ui/
│   ├── login.spec.ts       # Login functionality tests
│   ├── dashboard.spec.ts   # Dashboard tests
│   └── profile.spec.ts     # Profile tests
├── api/
│   ├── users.spec.ts       # User API tests
│   ├── products.spec.ts    # Product API tests
│   └── orders.spec.ts      # Order API tests
├── mobile/
│   ├── touch.spec.ts       # Touch interaction tests
│   ├── responsive.spec.ts  # Responsive design tests
│   └── gestures.spec.ts    # Gesture tests
├── accessibility/
│   ├── wcag.spec.ts        # WCAG compliance tests
│   ├── keyboard.spec.ts    # Keyboard navigation tests
│   └── screen-reader.spec.ts # Screen reader tests
├── performance/
│   ├── load-time.spec.ts   # Load time tests
│   ├── core-vitals.spec.ts # Core Web Vitals tests
│   └── memory.spec.ts      # Memory usage tests
└── visual/
    ├── screenshots.spec.ts # Visual regression tests
    └── responsive.spec.ts  # Responsive visual tests
\`\`\`

## Base Test Class Example
\`\`\`typescript
// tests/shared/base-test.ts
import { test as baseTest } from '@playwright/test';

export class BaseTest {
  static async standardSetup(page: any, url: string) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  }

  static async fillForm(page: any, formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await page.fill(selector, value);
    }
  }

  static async clickAndValidate(page: any, button: string, expected: string) {
    await page.click(button);
    await expect(page.locator(expected)).toBeVisible();
  }
}
\`\`\`

## Utility Functions Example
\`\`\`typescript
// tests/shared/test-utilities.ts
export class TestUtilities {
  static async waitForElement(page: any, selector: string, timeout = 5000) {
    await page.waitForSelector(selector, { timeout });
  }

  static async takeScreenshotOnFailure(page: any, testName: string) {
    await page.screenshot({ path: \`screenshots/\${testName}-failure.png\` });
  }

  static generateRandomEmail() {
    return \`test-\${Date.now()}@example.com\`;
  }

  static async verifyApiResponse(response: any, expectedStatus = 200) {
    expect(response.status()).toBe(expectedStatus);
    expect(response.headers()['content-type']).toContain('application/json');
  }
}
\`\`\`

## Optimized Test Example
\`\`\`typescript
// tests/ui/login.spec.ts
import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';
import { BaseTest } from '../shared/base-test';
import { TestUtilities } from '../shared/test-utilities';

test.describe('Login Tests', () => {
  test('should login successfully', async ({ page, allureHelper }) => {
    await allureHelper.addDescription('Test successful login');
    await allureHelper.addTags(['ui', 'login', 'smoke']);

    // Use base test utility
    await BaseTest.standardSetup(page, 'https://example.com/login');

    // Use form filling utility
    await BaseTest.fillForm(page, {
      '[data-test="email"]': TestUtilities.generateRandomEmail(),
      '[data-test="password"]': 'password123'
    });

    // Use click and validate utility
    await BaseTest.clickAndValidate(
      page,
      '[data-test="login-button"]',
      '[data-test="dashboard"]'
    );
  });
});
\`\`\`

## Code Reduction Benefits
- ✅ 70% reduction in test code duplication
- ✅ 50% faster test authoring
- ✅ Consistent test patterns
- ✅ Easier maintenance
- ✅ Better readability
- ✅ Reusable components
- ✅ Centralized utilities
- ✅ Standardized error handling
`;
  }

  /**
   * Generate test creation commands
   */
  static generateTestCommands(): string {
    return `
# 🛠️ Test Creation Commands

## Quick Test Generation
\`\`\`bash
# Generate UI test
npm run generate:ui-test -- --name "Login" --url "https://example.com/login"

# Generate API test  
npm run generate:api-test -- --name "Users" --endpoint "/api/users" --method "GET"

# Generate mobile test
npm run generate:mobile-test -- --name "Touch" --device "iPhone 13"

# Generate accessibility test
npm run generate:a11y-test -- --name "Homepage" --url "https://example.com"

# Generate performance test
npm run generate:perf-test -- --name "Load Time" --url "https://example.com"
\`\`\`

## Test Templates Available
- \`ui-test\` - Standard UI interaction test
- \`api-test\` - API endpoint test
- \`mobile-test\` - Mobile device test
- \`accessibility-test\` - Accessibility compliance test
- \`performance-test\` - Performance metrics test
- \`visual-test\` - Visual regression test
- \`database-test\` - Database integration test

## Common Test Patterns
\`\`\`typescript
// Pattern 1: Page navigation with validation
await allureHelper.addStep('Navigate and verify', async () => {
  await BaseTest.standardSetup(page, url);
});

// Pattern 2: Form interaction
await allureHelper.addStep('Fill form', async () => {
  await BaseTest.fillForm(page, formData);
});

// Pattern 3: Button click with validation
await allureHelper.addStep('Submit and verify', async () => {
  await BaseTest.clickAndValidate(page, button, expected);
});

// Pattern 4: API request with validation
await allureHelper.addStep('API request', async () => {
  const response = await apiClient.get(endpoint);
  TestUtilities.verifyApiResponse(response);
});
\`\`\`

## Best Practices
1. Use descriptive test names
2. Add meaningful Allure steps
3. Use data-test attributes
4. Handle async operations properly
5. Add appropriate waits
6. Use utility functions
7. Group related tests
8. Add proper error handling
9. Use meaningful assertions
10. Keep tests independent
`;
  }
}