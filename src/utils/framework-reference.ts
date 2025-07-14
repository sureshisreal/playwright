/**
 * Complete Framework Reference Guide
 * This file contains all available methods, helpers, and utilities in the framework
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
- ✅ Visual Regression Testing
- ✅ Database Testing support

## 🔧 Available Test Fixtures

### Primary Fixtures
\`\`\`typescript
import { test } from '../src/fixtures/test-fixtures';

test('example', async ({ 
  page,                    // Playwright Page object
  logger,                  // Custom logger
  screenshotHelper,        // Screenshot utilities
  videoHelper,             // Video recording
  apiClient,               // HTTP API client
  accessibilityHelper,     // Accessibility testing
  performanceHelper,       // Performance monitoring
  allureHelper,            // Allure reporting
  mobileHelper,            // Mobile device testing
  testData,                // Test data generation
  examplePage              // Example page object
}) => {
  // Your test code here
});
\`\`\`

### Specialized Test Types
\`\`\`typescript
import { 
  authenticatedTest,     // Pre-authenticated tests
  apiTest,              // API-only tests
  performanceTest,      // Performance-focused tests
  accessibilityTest,    // Accessibility-focused tests
  visualTest,           // Visual regression tests
  mobileTest,           // Mobile-specific tests
  databaseTest          // Database integration tests
} from '../src/fixtures/test-fixtures';
\`\`\`

## 📱 Page Object Methods

### Navigation Methods
\`\`\`typescript
await page.goto(url)                    // Navigate to URL
await page.goBack()                     // Navigate back
await page.goForward()                  // Navigate forward
await page.reload()                     // Reload page
await page.waitForURL(url)              // Wait for URL change
await page.waitForLoadState('load')     // Wait for page load
\`\`\`

### Element Interaction Methods
\`\`\`typescript
await page.click(selector)              // Click element
await page.dblclick(selector)           // Double click
await page.fill(selector, text)         // Fill input field
await page.type(selector, text)         // Type text slowly
await page.press(selector, key)         // Press key
await page.hover(selector)              // Hover over element
await page.focus(selector)              // Focus element
await page.blur(selector)               // Remove focus
await page.check(selector)              // Check checkbox/radio
await page.uncheck(selector)            // Uncheck checkbox
await page.selectOption(selector, value) // Select dropdown option
await page.setInputFiles(selector, files) // Upload files
await page.dragAndDrop(source, target)  // Drag and drop
\`\`\`

### Element Query Methods
\`\`\`typescript
page.locator(selector)                  // Get element locator
await page.$(selector)                  // Get element handle
await page.$$(selector)                 // Get all element handles
await page.textContent(selector)        // Get text content
await page.innerHTML(selector)          // Get inner HTML
await page.getAttribute(selector, name) // Get attribute value
await page.isVisible(selector)          // Check if visible
await page.isHidden(selector)           // Check if hidden
await page.isEnabled(selector)          // Check if enabled
await page.isDisabled(selector)         // Check if disabled
await page.isChecked(selector)          // Check if checked
await page.boundingBox(selector)        // Get element bounds
await page.screenshot()                 // Take page screenshot
\`\`\`

### Wait Methods
\`\`\`typescript
await page.waitForSelector(selector)    // Wait for element
await page.waitForTimeout(timeout)      // Wait for time
await page.waitForFunction(fn)          // Wait for function
await page.waitForEvent(event)          // Wait for event
await page.waitForResponse(url)         // Wait for response
await page.waitForRequest(url)          // Wait for request
await page.waitForConsoleMessage()      // Wait for console message
\`\`\`

### Mobile-Specific Methods
\`\`\`typescript
await page.tap(selector)                // Touch tap
await page.touchscreen.tap(x, y)        // Touch at coordinates
await page.mouse.wheel(0, 100)          // Scroll wheel
await page.keyboard.press('ArrowDown')  // Press key
await page.setViewportSize({width, height}) // Set viewport
await page.emulateMedia({media: 'print'}) // Emulate media
\`\`\`

## 🔍 Selector Types

### Text-Based Selectors
\`\`\`typescript
'text=Button'                           // Exact text match
'text=/regex/i'                         // Regex text match
'button:has-text("Submit")'             // Has text selector
'div >> text=Content'                   // Child text selector
\`\`\`

### Attribute Selectors
\`\`\`typescript
'[data-test="submit"]'                  // Data attribute
'[placeholder="Search"]'                // Placeholder attribute
'[aria-label="Close"]'                  // ARIA label
'input[type="email"]'                   // Input type
\`\`\`

### CSS Selectors
\`\`\`typescript
'#id'                                   // ID selector
'.class'                                // Class selector
'button.primary'                        // Element with class
'div > button'                          // Direct child
'div button'                            // Descendant
'button:nth-child(2)'                   // Nth child
'button:first-child'                    // First child
'button:last-child'                     // Last child
'input:visible'                         // Visible elements
'input:enabled'                         // Enabled elements
'input:disabled'                        // Disabled elements
'input:checked'                         // Checked elements
\`\`\`

### Advanced Selectors
\`\`\`typescript
'button:near(input)'                    // Near another element
'button:above(footer)'                  // Above another element
'button:below(header)'                  // Below another element
'button:left-of(input)'                 // Left of another element
'button:right-of(input)'                // Right of another element
\`\`\`

## 🧪 Assertion Methods

### Page Assertions
\`\`\`typescript
await expect(page).toHaveTitle(title)   // Check page title
await expect(page).toHaveURL(url)       // Check URL
await expect(page).toHaveScreenshot()   // Visual comparison
\`\`\`

### Element Assertions
\`\`\`typescript
await expect(locator).toBeVisible()     // Check visibility
await expect(locator).toBeHidden()      // Check hidden
await expect(locator).toBeEnabled()     // Check enabled
await expect(locator).toBeDisabled()    // Check disabled
await expect(locator).toBeChecked()     // Check checked state
await expect(locator).toBeEmpty()       // Check empty
await expect(locator).toBeEditable()    // Check editable
await expect(locator).toBeFocused()     // Check focused
await expect(locator).toHaveText(text)  // Check text content
await expect(locator).toHaveValue(value) // Check input value
await expect(locator).toHaveAttribute(name, value) // Check attribute
await expect(locator).toHaveClass(className) // Check class
await expect(locator).toHaveCount(count) // Check element count
await expect(locator).toHaveCSS(property, value) // Check CSS
await expect(locator).toHaveScreenshot() // Visual comparison
\`\`\`

### API Assertions
\`\`\`typescript
await expect(response).toBeOK()         // Check 200 status
await expect(response.status()).toBe(200) // Check specific status
await expect(response.json()).toEqual(data) // Check JSON response
await expect(response.text()).toContain(text) // Check text content
\`\`\`

## 🛠️ Helper Methods

### Logger Helper
\`\`\`typescript
logger.info('Information message')      // Info level
logger.warn('Warning message')          // Warning level
logger.error('Error message')           // Error level
logger.debug('Debug message')           // Debug level
logger.setLevel('info')                 // Set log level
\`\`\`

### Screenshot Helper
\`\`\`typescript
await screenshotHelper.takeScreenshot('name') // Take screenshot
await screenshotHelper.takeFullPageScreenshot() // Full page screenshot
await screenshotHelper.takeElementScreenshot(selector) // Element screenshot
await screenshotHelper.compareScreenshots(expected, actual) // Compare screenshots
\`\`\`

### Video Helper
\`\`\`typescript
await videoHelper.startRecording()     // Start video recording
await videoHelper.stopRecording()      // Stop video recording
await videoHelper.saveVideo('name')    // Save video with name
\`\`\`

### API Client Helper
\`\`\`typescript
await apiClient.get(url)               // GET request
await apiClient.post(url, data)        // POST request
await apiClient.put(url, data)         // PUT request
await apiClient.patch(url, data)       // PATCH request
await apiClient.delete(url)            // DELETE request
await apiClient.setAuthToken(token)    // Set auth token
await apiClient.setHeaders(headers)    // Set custom headers
\`\`\`

### Accessibility Helper
\`\`\`typescript
await accessibilityHelper.runAccessibilityScan() // Run full scan
await accessibilityHelper.scanElement(selector) // Scan specific element
await accessibilityHelper.checkColorContrast() // Check color contrast
await accessibilityHelper.checkKeyboardNavigation() // Check keyboard nav
await accessibilityHelper.checkAriaAttributes() // Check ARIA
await accessibilityHelper.checkFormLabels() // Check form labels
await accessibilityHelper.checkImageAltText() // Check alt text
await accessibilityHelper.checkHeadingStructure() // Check headings
\`\`\`

### Performance Helper
\`\`\`typescript
await performanceHelper.startPerformanceMonitoring() // Start monitoring
await performanceHelper.getPerformanceMetrics() // Get metrics
await performanceHelper.getCoreWebVitals() // Get Core Web Vitals
await performanceHelper.getNetworkMetrics() // Get network metrics
await performanceHelper.getMemoryUsage() // Get memory usage
await performanceHelper.measurePageLoad() // Measure page load
await performanceHelper.measureAction(fn) // Measure action performance
\`\`\`

### Allure Helper
\`\`\`typescript
await allureHelper.addDescription(text) // Add test description
await allureHelper.addTags(tags)        // Add test tags
await allureHelper.addStep(name, fn)    // Add test step
await allureHelper.addAttachment(name, content) // Add attachment
await allureHelper.addScreenshot(name) // Add screenshot
await allureHelper.addVideoAttachment(path) // Add video
await allureHelper.addLink(url, name)  // Add link
await allureHelper.addIssue(key)       // Add issue reference
await allureHelper.addTestCase(key)    // Add test case reference
\`\`\`

### Mobile Helper
\`\`\`typescript
await mobileHelper.setDevice(deviceName) // Set mobile device
await mobileHelper.setViewport(width, height) // Set viewport
await mobileHelper.rotate()            // Rotate device
await mobileHelper.testTouchInteractions(selector) // Test touch
await mobileHelper.testSwipeGestures() // Test swipe gestures
await mobileHelper.testPinchZoom()     // Test pinch zoom
await mobileHelper.testDeviceOrientation() // Test orientation
\`\`\`

### Test Data Helper
\`\`\`typescript
testData.generateUser()               // Generate user data
testData.generateEmail()              // Generate email
testData.generatePassword()           // Generate password
testData.generatePhoneNumber()        // Generate phone
testData.generateAddress()            // Generate address
testData.generateCreditCard()         // Generate credit card
testData.generateRandomString(length) // Generate random string
testData.generateRandomNumber(min, max) // Generate random number
\`\`\`

## 📊 Test Organization

### Test Structure
\`\`\`typescript
import { test } from '../src/fixtures/test-fixtures';

test.describe('Feature Name', () => {
  test.beforeAll(async () => {
    // Setup before all tests
  });

  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('https://example.com');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });

  test.afterAll(async () => {
    // Cleanup after all tests
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });

  test.skip('should skip this test', async ({ page }) => {
    // Skipped test
  });

  test.only('should only run this test', async ({ page }) => {
    // Only this test will run
  });
});
\`\`\`

### Test Annotations
\`\`\`typescript
test('test name', {
  tag: '@smoke',                      // Tag for filtering
  annotation: {
    type: 'issue',
    description: 'Bug #123'
  }
}, async ({ page }) => {
  // Test implementation
});
\`\`\`

### Test Timeouts
\`\`\`typescript
test('test name', async ({ page }) => {
  test.setTimeout(30000);             // Set test timeout
  
  await page.goto('https://example.com', {
    timeout: 10000                    // Set action timeout
  });
});
\`\`\`

## 🔧 Configuration Options

### Playwright Config
\`\`\`typescript
// playwright.config.ts
export default {
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  workers: 4,
  use: {
    headless: true,
    video: 'on-failure',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } }
  ]
};
\`\`\`

### Environment Configuration
\`\`\`typescript
// Available environment variables
process.env.BASE_URL              // Base URL for tests
process.env.API_BASE_URL          // API base URL
process.env.HEADLESS              // Run in headless mode
process.env.BROWSER               // Browser to use
process.env.SLOW_MO               // Slow motion delay
process.env.RETRIES               // Number of retries
process.env.TIMEOUT               // Test timeout
process.env.WORKERS               // Number of workers
\`\`\`

## 🚀 Quick Start Templates

### Basic UI Test
\`\`\`typescript
import { test } from '../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

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
import { test } from '../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test('API test', async ({ apiClient, allureHelper }) => {
  await allureHelper.addDescription('Test API endpoint');
  await allureHelper.addTags(['api', 'smoke']);
  
  const response = await apiClient.get('/api/users');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('users');
});
\`\`\`

### Mobile Test
\`\`\`typescript
import { test } from '../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test('mobile test', async ({ page, mobileHelper, allureHelper }) => {
  await allureHelper.addDescription('Test mobile functionality');
  await allureHelper.addTags(['mobile', 'touch']);
  
  await mobileHelper.setDevice('iPhone 13');
  await page.goto('https://example.com');
  
  const touchResult = await mobileHelper.testTouchInteractions('button');
  expect(touchResult.tap).toBe(true);
});
\`\`\`

## 📝 Best Practices

### Test Writing
1. Use descriptive test names
2. Add meaningful steps with allureHelper
3. Use data-test attributes for selectors
4. Handle async operations properly
5. Add appropriate waits
6. Use page objects for complex pages
7. Group related tests in describe blocks
8. Add proper error handling
9. Use meaningful assertions
10. Keep tests independent

### Performance
1. Use parallel execution
2. Minimize page loads
3. Use appropriate timeouts
4. Clean up after tests
5. Use beforeEach/afterEach efficiently
6. Avoid unnecessary waits
7. Use selective test running
8. Monitor test execution time
9. Use test sharding for large suites
10. Optimize CI/CD pipeline

### Maintenance
1. Keep selectors maintainable
2. Use configuration management
3. Regular test review
4. Update dependencies
5. Monitor test stability
6. Use proper version control
7. Document test purposes
8. Handle flaky tests
9. Regular cleanup
10. Continuous improvement

This framework provides a comprehensive testing solution with all the tools needed for modern web application testing.
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

## Mobile Testing
\`\`\`typescript
await mobileHelper.setDevice('iPhone 13');
await mobileHelper.testTouchInteractions('button');
\`\`\`

## API Testing
\`\`\`typescript
const response = await apiClient.get('/api/endpoint');
expect(response.status()).toBe(200);
\`\`\`
`;
  }
}