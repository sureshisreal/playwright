/**
 * Complete Framework Reference Guide
 */
export class FrameworkReference {
  /**
   * Get complete framework documentation
   */
  static getCompleteReference(): string {
    return `
# 📚 Complete Playwright Test Framework Reference

## 🏗️ Framework Architecture

### Core Components
- **Base Classes**: BaseTest, BasePage for common functionality
- **Fixtures**: Extended test fixtures with utilities and helpers
- **Helpers**: Specialized helpers for different testing needs
- **Page Objects**: Encapsulated page interactions
- **Utilities**: Logging, data generation, and reporting tools

### Testing Capabilities
- ✅ UI Testing with Page Object Model
- ✅ API Testing with HTTP client
- ✅ Mobile Testing with device emulation
- ✅ Accessibility Testing with axe-core
- ✅ Performance Testing with Core Web Vitals
- ✅ Cross-browser Testing (Chrome, Firefox, Safari)

## 🔧 Available Test Fixtures

\`\`\`typescript
import { test } from '../src/fixtures/test-fixtures';

test('example', async ({ 
  page,                    // Playwright Page object
  logger,                  // Custom logger
  screenshotHelper,        // Screenshot utilities
  apiClient,               // HTTP API client
  accessibilityHelper,     // Accessibility testing
  performanceHelper,       // Performance monitoring
  allureHelper,            // Allure reporting
  mobileHelper,            // Mobile device testing
  testData                 // Test data generation
}) => {
  // Your test code here
});
\`\`\`

## 📱 Essential Methods

### Navigation
- \`page.goto(url)\` - Navigate to URL
- \`page.click(selector)\` - Click element
- \`page.fill(selector, text)\` - Fill input field
- \`page.waitForSelector(selector)\` - Wait for element

### Assertions
- \`expect(page).toHaveTitle(title)\` - Check page title
- \`expect(locator).toBeVisible()\` - Check visibility
- \`expect(locator).toHaveText(text)\` - Check text content

### Framework Helpers
- \`allureHelper.addStep(name, fn)\` - Add test step
- \`screenshotHelper.takeScreenshot(name)\` - Take screenshot
- \`mobileHelper.setDevice(device)\` - Set mobile device
- \`accessibilityHelper.runAccessibilityScan()\` - Run a11y scan

## 🚀 Quick Start Templates

### Basic UI Test
\`\`\`typescript
test('basic UI test', async ({ page, allureHelper }) => {
  await allureHelper.addDescription('Test basic UI functionality');
  await allureHelper.addTags(['ui', 'smoke']);
  
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
  await page.click('button');
  await expect(page.locator('.result')).toBeVisible();
});
\`\`\`

### API Test
\`\`\`typescript
test('API test', async ({ apiClient, allureHelper }) => {
  await allureHelper.addDescription('Test API endpoint');
  await allureHelper.addTags(['api', 'smoke']);
  
  const response = await apiClient.get('/api/users');
  expect(response.status()).toBe(200);
});
\`\`\`

## 📝 Best Practices

1. Use descriptive test names
2. Add meaningful steps with allureHelper
3. Use data-test attributes for selectors
4. Handle async operations properly
5. Keep tests independent
`;
  }

  /**
   * Get quick reference card
   */
  static getQuickReference(): string {
    return `
# 🚀 Quick Reference Card

## Essential Commands
- \`page.goto(url)\` - Navigate
- \`page.click(selector)\` - Click
- \`page.fill(selector, text)\` - Fill input
- \`expect(locator).toBeVisible()\` - Assert visible
- \`allureHelper.addStep(name, fn)\` - Add step
- \`screenshotHelper.takeScreenshot(name)\` - Screenshot

## Common Selectors
- \`'text=Button'\` - Text content
- \`'[data-test=submit]'\` - Data attribute
- \`'#id'\` - ID selector
- \`'.class'\` - Class selector

## Test Structure
\`\`\`typescript
test('name', async ({ page, allureHelper }) => {
  await allureHelper.addStep('Step 1', async () => {
    await page.goto('url');
  });
});
\`\`\`
`;
  }
}