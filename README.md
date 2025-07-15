# Comprehensive Playwright Test Automation Framework

A complete test automation framework built with Playwright, featuring video recording, screenshots, accessibility testing, performance monitoring, and comprehensive reporting integrations.

## 🚀 Features

### Core Testing Capabilities
- **UI Testing**: Page Object Model with robust element interactions
- **API Testing**: Comprehensive REST API testing with validation
- **Accessibility Testing**: Automated a11y testing with axe-core integration
- **Performance Testing**: Core Web Vitals, load time, and resource monitoring
- **Cross-Browser Testing**: Chrome, Firefox, Safari, and mobile devices
- **Parallel Execution**: Multi-worker test execution

### Media & Documentation
- **Video Recording**: Automatic video capture for test executions
- **Screenshots**: Failure screenshots and step-by-step captures
- **Comprehensive Logging**: Detailed test execution logs
- **Test Documentation**: Automatic test case documentation

### Reporting & Integrations
- **Allure Reports**: Rich HTML reports with attachments
- **Multiple Formats**: HTML, JSON, JUnit XML reports
- **Performance Metrics**: Detailed performance analysis

### Advanced Features
- **Test Data Management**: Dynamic test data generation
- **Environment Configuration**: Multi-environment support
- **Error Handling**: Robust error handling and recovery
- **Fixtures & Utilities**: Reusable test components

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwright-test-framework
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🚀 Quick Start

### Run Tests
```bash
# Run all tests
npx playwright test

# Run specific test suites
npx playwright test tests/ui
npx playwright test tests/api
npx playwright test tests/mobile

# Run with UI mode
npx playwright test --ui

# Generate reports
npm run analytics
```

### Generate New Tests
```bash
# Generate UI test
node generate-test.js --type ui --name "Login Test" --url "https://example.com/login"

# Generate API test
node generate-test.js --type api --name "Users API" --endpoint "/api/users"

# Generate mobile test
node generate-test.js --type mobile --name "Touch Test" --device "iPhone 13"
```

## 📁 Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   ├── fixtures/        # Test fixtures
│   ├── helpers/         # Test helpers
│   ├── pages/           # Page objects
│   ├── templates/       # Test templates
│   └── utils/           # Utilities
├── tests/
│   ├── ui/              # UI tests
│   ├── api/             # API tests
│   ├── mobile/          # Mobile tests
│   ├── accessibility/   # Accessibility tests
│   └── performance/     # Performance tests
├── analytics/           # Test analytics and reports
├── screenshots/         # Test screenshots
├── videos/             # Test videos
└── test-results/       # Test results
```

## 🔧 Configuration

The framework supports multiple environments and can be configured through:

- `playwright.config.ts` - Main Playwright configuration
- `src/config/` - Environment-specific configurations
- `.env` - Environment variables

## 📊 Reporting

### Analytics Dashboard
```bash
npm run analytics
```
Opens an interactive dashboard showing:
- Test execution trends
- Pass/fail rates
- Performance metrics
- Flaky test detection

### Allure Reports
```bash
npx allure generate allure-results --clean
npx allure open
```

## 🧪 Writing Tests

### Basic UI Test
```typescript
import { test } from '../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test('should login successfully', async ({ page, allureHelper }) => {
  await allureHelper.addDescription('Test user login functionality');
  await allureHelper.addTags(['ui', 'authentication']);
  
  await page.goto('https://example.com/login');
  await page.fill('[data-test="username"]', 'testuser');
  await page.fill('[data-test="password"]', 'password');
  await page.click('[data-test="login-button"]');
  
  await expect(page.locator('[data-test="dashboard"]')).toBeVisible();
});
```

### API Test
```typescript
test('should get users', async ({ apiClient, allureHelper }) => {
  await allureHelper.addDescription('Test users API endpoint');
  await allureHelper.addTags(['api', 'users']);
  
  const response = await apiClient.get('/api/users');
  expect(response.status()).toBe(200);
  
  const users = await response.json();
  expect(users).toHaveLength(greaterThan(0));
});
```

## 🎯 Best Practices

1. **Use descriptive test names** that clearly state what is being tested
2. **Add meaningful Allure steps** to improve test readability
3. **Use data-test attributes** for reliable element selection
4. **Handle async operations properly** with appropriate waits
5. **Keep tests independent** - each test should be able to run in isolation
6. **Use page objects** for complex page interactions
7. **Add proper error handling** for flaky operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:
- Check the [Framework Guide](FRAMEWORK_GUIDE.md)
- Review existing tests for examples
- Open an issue for bugs or feature requests

---

**Happy Testing!** 🎉