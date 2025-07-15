# 📚 Playwright Test Framework Guide

## 🏗️ Framework Overview

This test automation framework provides end-to-end testing capabilities with advanced features including UI testing, API testing, mobile testing, accessibility testing, and performance monitoring.

### Key Features
- ✅ **Multi-Browser Support**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile Testing**: iOS, Android, and tablet device emulation
- ✅ **Accessibility Testing**: WCAG 2.1 compliance with axe-core
- ✅ **Performance Monitoring**: Core Web Vitals and custom metrics
- ✅ **Visual Testing**: Screenshot comparison and regression detection
- ✅ **API Testing**: REST API testing with authentication
- ✅ **Reporting**: Allure reports with rich attachments
- ✅ **CI/CD Integration**: GitHub Actions, Jenkins, and more

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

# Generate reports
npm run report
npm run analytics
```

### 3. Generate New Tests
```bash
node generate-test.js --type ui --name "Login Test" --url "https://example.com/login"
```

## 🔧 Available Methods and Utilities

### Core Page Methods
```typescript
// Navigation
await page.goto(url)
await page.goBack()
await page.reload()

// Element Interaction
await page.click(selector)
await page.fill(selector, text)
await page.type(selector, text)
await page.hover(selector)

// Element Queries
await page.locator(selector)
await page.textContent(selector)
await page.isVisible(selector)

// Waiting
await page.waitForSelector(selector)
await page.waitForTimeout(ms)
await page.waitForLoadState('networkidle')
```

### Framework Helpers
```typescript
// Allure Reporting
await allureHelper.addStep('Step name', async () => {
  // Step implementation
});
await allureHelper.addDescription('Test description');
await allureHelper.addTags(['ui', 'smoke']);

// Screenshots
await screenshotHelper.takeScreenshot('screenshot-name');

// Mobile Testing
await mobileHelper.setDevice('iPhone 13');
await mobileHelper.testTouchInteractions(selector);

// API Testing
const response = await apiClient.get('/api/endpoint');
await apiClient.post('/api/endpoint', data);

// Accessibility Testing
const results = await accessibilityHelper.runAccessibilityScan();

// Performance Testing
await performanceHelper.startPerformanceMonitoring();
const metrics = await performanceHelper.getPerformanceMetrics();
```

### Common Selectors
```typescript
'text=Button'                    // Exact text match
'[data-test="submit-button"]'    // Data attribute (recommended)
'#element-id'                    // ID selector
'.class-name'                    // Class selector
'button:nth-child(2)'            // Nth child
'input:visible'                  // Visible elements only
```

### Assertions
```typescript
// Page assertions
await expect(page).toHaveTitle('Title');
await expect(page).toHaveURL('https://example.com');

// Element assertions
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Expected text');
await expect(locator).toHaveValue('Expected value');

// API assertions
await expect(response).toBeOK();
await expect(response.status()).toBe(200);
```

## 📱 Mobile Testing

### Device Configuration
```typescript
const devices = [
  'iPhone 13',
  'Samsung Galaxy S21',
  'iPad Air',
  'Google Pixel 6'
];

await mobileHelper.setDevice('iPhone 13');
```

### Touch Interactions
```typescript
await page.tap(selector);
await mobileHelper.swipeLeft();
await mobileHelper.pinchZoom(scale);
await mobileHelper.rotate();
```

## 🔍 Accessibility Testing

### WCAG Compliance Checks
```typescript
const results = await accessibilityHelper.runAccessibilityScan();
expect(results.violations).toHaveLength(0);

await accessibilityHelper.checkColorContrast();
await accessibilityHelper.checkKeyboardNavigation();
```

## ⚡ Performance Testing

### Core Web Vitals
```typescript
await performanceHelper.startPerformanceMonitoring();
await page.goto('https://example.com');

const metrics = await performanceHelper.getPerformanceMetrics();
expect(metrics.loadTime).toBeLessThan(3000);

const vitals = await performanceHelper.getCoreWebVitals();
expect(vitals.LCP).toBeLessThan(2500);
```

## 🌐 API Testing

### HTTP Methods
```typescript
const response = await apiClient.get('/api/users');
expect(response.status()).toBe(200);

const newUser = await apiClient.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

## 📊 Reporting and Analytics

### Allure Reports
```typescript
await allureHelper.addDescription('Detailed test description');
await allureHelper.addTags(['ui', 'smoke', 'regression']);
await allureHelper.addStep('Login to application', async () => {
  await page.goto('/login');
  await page.fill('[data-test="username"]', 'user');
  await page.click('[data-test="login-button"]');
});
```

## 🔄 Test Organization

### Test Structure
```typescript
import { test } from '../src/fixtures/test-fixtures';

test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com');
  });

  test('should do something', async ({ page, allureHelper }) => {
    await allureHelper.addStep('Test step', async () => {
      // Test implementation
    });
  });
});
```

## 🎯 Best Practices

### Test Writing
1. Use descriptive test names
2. Add meaningful Allure steps
3. Use data-test attributes for selectors
4. Handle async operations properly
5. Keep tests independent
6. Use page objects for complex pages
7. Add proper error handling

### Performance
1. Run tests in parallel
2. Use beforeEach/afterEach efficiently
3. Minimize page loads
4. Use appropriate timeouts
5. Clean up resources after tests

### Maintenance
1. Keep selectors maintainable
2. Regular test review
3. Update dependencies regularly
4. Monitor test stability
5. Use version control effectively

This framework provides a complete solution for modern web application testing with all the tools and utilities needed for comprehensive test coverage.