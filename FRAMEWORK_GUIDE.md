# 📚 Complete Playwright Test Framework Guide

## 🏗️ Framework Overview

This comprehensive test automation framework provides end-to-end testing capabilities with advanced features including UI testing, API testing, mobile testing, accessibility testing, and performance monitoring.

### Key Features
- ✅ **Multi-Browser Support**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile Testing**: iOS, Android, and tablet device emulation
- ✅ **Accessibility Testing**: WCAG 2.1 compliance with axe-core
- ✅ **Performance Monitoring**: Core Web Vitals and custom metrics
- ✅ **Visual Testing**: Screenshot comparison and regression detection
- ✅ **API Testing**: REST API testing with authentication
- ✅ **Reporting**: Allure reports with rich attachments
- ✅ **CI/CD Integration**: GitHub Actions, Jenkins, and more
- ✅ **Test Management**: Qase integration for test case management

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run Tests
```bash
# Run all tests
npm run test

# Run specific test types
npm run test:ui
npm run test:api
npm run test:mobile
npm run test:accessibility
npm run test:performance

# Run with UI mode
npm run test:ui-mode

# Generate reports
npm run report
npm run analytics
```

### 3. Generate New Tests
```bash
# Generate UI test
node -e "
const { TestTemplates } = require('./src/templates/test-templates');
const template = TestTemplates.generateUITest({
  testName: 'Login Page',
  url: 'https://example.com/login',
  title: 'Login',
  interactions: [
    { action: 'fill', selector: '[data-test=\"email\"]', value: 'test@example.com' },
    { action: 'fill', selector: '[data-test=\"password\"]', value: 'password123' },
    { action: 'click', selector: '[data-test=\"login-button\"]', expected: '[data-test=\"dashboard\"]' }
  ]
});
console.log(template);
"
```

## 🔧 Available Methods and Utilities

### Core Page Methods
```typescript
// Navigation
await page.goto(url)
await page.goBack()
await page.goForward()
await page.reload()
await page.waitForURL(url)

// Element Interaction
await page.click(selector)
await page.fill(selector, text)
await page.type(selector, text)
await page.press(selector, key)
await page.hover(selector)
await page.check(selector)
await page.selectOption(selector, value)

// Element Queries
await page.locator(selector)
await page.textContent(selector)
await page.isVisible(selector)
await page.isEnabled(selector)
await page.getAttribute(selector, name)

// Waiting
await page.waitForSelector(selector)
await page.waitForTimeout(ms)
await page.waitForLoadState('networkidle')
await page.waitForResponse(url)
```

### Framework Helpers
```typescript
// Allure Reporting
await allureHelper.addStep('Step name', async () => {
  // Step implementation
});
await allureHelper.addDescription('Test description');
await allureHelper.addTags(['ui', 'smoke']);
await allureHelper.addAttachment('name', content);

// Screenshots
await screenshotHelper.takeScreenshot('screenshot-name');
await screenshotHelper.takeFullPageScreenshot();
await screenshotHelper.takeElementScreenshot(selector);

// Mobile Testing
await mobileHelper.setDevice('iPhone 13');
await mobileHelper.testTouchInteractions(selector);
await mobileHelper.testSwipeGestures();
await mobileHelper.rotate();

// API Testing
const response = await apiClient.get('/api/endpoint');
await apiClient.post('/api/endpoint', data);
await apiClient.setAuthToken(token);

// Accessibility Testing
const results = await accessibilityHelper.runAccessibilityScan();
await accessibilityHelper.checkColorContrast();
await accessibilityHelper.checkKeyboardNavigation();

// Performance Testing
await performanceHelper.startPerformanceMonitoring();
const metrics = await performanceHelper.getPerformanceMetrics();
const vitals = await performanceHelper.getCoreWebVitals();
```

### Common Selectors
```typescript
// Text-based selectors
'text=Button'                    // Exact text match
'text=/Submit/i'                 // Regex text match
'button:has-text("Submit")'      // Contains text

// Attribute selectors
'[data-test="submit-button"]'    // Data attribute (recommended)
'[placeholder="Search"]'         // Placeholder text
'[aria-label="Close"]'           // ARIA label

// CSS selectors
'#element-id'                    // ID selector
'.class-name'                    // Class selector
'button.primary'                 // Element with class
'div > button'                   // Direct child
'button:nth-child(2)'            // Nth child
'input:visible'                  // Visible elements only
'input:enabled'                  // Enabled elements only
```

### Assertions
```typescript
// Page assertions
await expect(page).toHaveTitle('Title');
await expect(page).toHaveURL('https://example.com');

// Element assertions
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toHaveText('Expected text');
await expect(locator).toHaveValue('Expected value');
await expect(locator).toHaveAttribute('name', 'value');
await expect(locator).toHaveCount(5);

// API assertions
await expect(response).toBeOK();
await expect(response.status()).toBe(200);
await expect(response.json()).toEqual(expectedData);
```

## 📱 Mobile Testing

### Device Configuration
```typescript
// Available devices
const devices = [
  'iPhone 13',
  'iPhone 13 Pro',
  'iPhone 12',
  'Samsung Galaxy S21',
  'Google Pixel 6',
  'iPad Air',
  'iPad Pro'
];

// Custom device setup
await mobileHelper.setDevice('iPhone 13');
await mobileHelper.setViewport(375, 812);
await mobileHelper.setUserAgent('iOS user agent');
```

### Touch Interactions
```typescript
// Basic touch interactions
await page.tap(selector);
await page.touchscreen.tap(x, y);

// Swipe gestures
await mobileHelper.swipeLeft();
await mobileHelper.swipeRight();
await mobileHelper.swipeUp();
await mobileHelper.swipeDown();

// Pinch and zoom
await mobileHelper.pinchZoom(scale);
await mobileHelper.testPinchZoom();

// Device rotation
await mobileHelper.rotate();
await mobileHelper.setOrientation('portrait');
await mobileHelper.setOrientation('landscape');
```

## 🔍 Accessibility Testing

### WCAG Compliance Checks
```typescript
// Full accessibility scan
const results = await accessibilityHelper.runAccessibilityScan();
expect(results.violations).toHaveLength(0);

// Specific checks
await accessibilityHelper.checkColorContrast();
await accessibilityHelper.checkKeyboardNavigation();
await accessibilityHelper.checkAriaAttributes();
await accessibilityHelper.checkFormLabels();
await accessibilityHelper.checkImageAltText();
await accessibilityHelper.checkHeadingStructure();

// Test keyboard navigation
const keyboardResults = await accessibilityHelper.testKeyboardNavigation();
expect(keyboardResults.tabOrder).toBeDefined();
expect(keyboardResults.trapFocus).toBe(true);

// Test screen reader compatibility
const screenReaderResults = await accessibilityHelper.testScreenReaderCompatibility();
expect(screenReaderResults.landmarks).toHaveLength(greaterThan(0));
```

## ⚡ Performance Testing

### Core Web Vitals
```typescript
// Start performance monitoring
await performanceHelper.startPerformanceMonitoring();

// Navigate to page
await page.goto('https://example.com');

// Get performance metrics
const metrics = await performanceHelper.getPerformanceMetrics();
expect(metrics.loadTime).toBeLessThan(3000);
expect(metrics.firstContentfulPaint).toBeLessThan(1500);
expect(metrics.largestContentfulPaint).toBeLessThan(2500);
expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1);

// Get Core Web Vitals
const vitals = await performanceHelper.getCoreWebVitals();
expect(vitals.LCP).toBeLessThan(2500);
expect(vitals.FID).toBeLessThan(100);
expect(vitals.CLS).toBeLessThan(0.1);
```

### Custom Performance Metrics
```typescript
// Measure specific actions
const actionTime = await performanceHelper.measureAction(async () => {
  await page.click('[data-test="submit-button"]');
  await page.waitForSelector('[data-test="result"]');
});
expect(actionTime).toBeLessThan(2000);

// Monitor memory usage
const memoryUsage = await performanceHelper.getMemoryUsage();
expect(memoryUsage.usedJSHeapSize).toBeLessThan(50000000); // 50MB
```

## 🌐 API Testing

### HTTP Methods
```typescript
// GET request
const response = await apiClient.get('/api/users');
expect(response.status()).toBe(200);

// POST request
const newUser = await apiClient.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
expect(newUser.status()).toBe(201);

// PUT request
await apiClient.put('/api/users/1', {
  name: 'Jane Doe'
});

// DELETE request
await apiClient.delete('/api/users/1');
```

### Authentication
```typescript
// Set authentication token
await apiClient.setAuthToken('Bearer token123');

// Set custom headers
await apiClient.setHeaders({
  'Authorization': 'Bearer token123',
  'Content-Type': 'application/json'
});

// OAuth flow
const token = await apiClient.authenticateOAuth({
  clientId: 'client-id',
  clientSecret: 'client-secret'
});
```

## 📊 Reporting and Analytics

### Allure Reports
```typescript
// Add test metadata
await allureHelper.addDescription('Detailed test description');
await allureHelper.addTags(['ui', 'smoke', 'regression']);
await allureHelper.addOwner('john.doe@example.com');
await allureHelper.addSeverity('critical');

// Add test steps
await allureHelper.addStep('Login to application', async () => {
  await page.goto('/login');
  await page.fill('[data-test="username"]', 'user');
  await page.fill('[data-test="password"]', 'pass');
  await page.click('[data-test="login-button"]');
});

// Add attachments
await allureHelper.addAttachment('Request payload', JSON.stringify(data));
await allureHelper.addScreenshot('Login page');
await allureHelper.addVideoAttachment('test-video.webm');
```

### Analytics Dashboard
```typescript
// Generate analytics
npm run analytics

// View dashboard
open analytics/dashboard/index.html

// Dashboard features:
// - Test execution trends
// - Pass/fail rates
// - Performance metrics
// - Flaky test detection
// - Mobile testing coverage
// - Accessibility compliance
```

## 🔄 Test Organization

### Test Structure
```typescript
import { test } from '../src/fixtures/test-fixtures';

test.describe('Feature Tests', () => {
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

  test('should do something', async ({ page, allureHelper }) => {
    await allureHelper.addStep('Test step', async () => {
      // Test implementation
    });
  });
});
```

### Test Configuration
```typescript
// playwright.config.ts
export default {
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  workers: 4,
  use: {
    headless: true,
    video: 'on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } }
  ]
};
```

## 🎯 Best Practices

### Test Writing
1. **Use descriptive test names** that clearly state what is being tested
2. **Add meaningful Allure steps** to improve test readability
3. **Use data-test attributes** for reliable element selection
4. **Handle async operations properly** with appropriate waits
5. **Keep tests independent** - each test should be able to run in isolation
6. **Use page objects** for complex page interactions
7. **Add proper error handling** for flaky operations
8. **Use meaningful assertions** that provide clear failure messages

### Performance
1. **Run tests in parallel** to reduce execution time
2. **Use beforeEach/afterEach efficiently** to avoid redundant setup
3. **Minimize page loads** by grouping related tests
4. **Use appropriate timeouts** - not too short, not too long
5. **Clean up resources** after tests complete
6. **Monitor test execution time** and optimize slow tests

### Maintenance
1. **Keep selectors maintainable** using data-test attributes
2. **Regular test review** to remove obsolete tests
3. **Update dependencies** regularly
4. **Monitor test stability** and fix flaky tests
5. **Use version control** effectively with meaningful commits
6. **Document test purposes** and expected behaviors

## 🔧 Troubleshooting

### Common Issues

**Tests failing due to timing issues:**
```typescript
// Use proper waits instead of fixed timeouts
await page.waitForSelector('[data-test="element"]');
await page.waitForLoadState('networkidle');
```

**Element not found errors:**
```typescript
// Check if element exists before interacting
await expect(page.locator('[data-test="element"]')).toBeVisible();
await page.click('[data-test="element"]');
```

**Performance test failures:**
```typescript
// Allow for reasonable performance thresholds
expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds instead of 2
```

**Mobile test issues:**
```typescript
// Ensure proper device setup
await mobileHelper.setDevice('iPhone 13');
await page.waitForLoadState('networkidle');
```

### Debug Mode
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test with debug
npx playwright test --debug tests/ui/login.spec.ts
```

## 📈 CI/CD Integration

### GitHub Actions
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test
      - name: Upload test results
        uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-results
          path: test-results/
```

This framework provides a complete solution for modern web application testing with all the tools and utilities needed for comprehensive test coverage.