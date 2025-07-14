import { test as baseTest, expect } from '@playwright/test';
import { Logger } from '../utils/logger';
import { ScreenshotHelper } from '../utils/screenshot-helper';
import { VideoHelper } from '../utils/video-helper';
import { ApiClient } from '../utils/api-client';
import { AccessibilityHelper } from '../helpers/accessibility-helper';
import { PerformanceHelper } from '../helpers/performance-helper';
import { AllureHelper } from '../helpers/allure-helper';
import { MobileHelper } from '../helpers/mobile-helper';
import { TestData } from '../utils/test-data';
import { testConfig } from '../config/test-config';
import { ExamplePage } from '../pages/example-page';

/**
 * Extended test fixtures with all framework utilities
 */
export interface TestFixtures {
  logger: Logger;
  screenshotHelper: ScreenshotHelper;
  videoHelper: VideoHelper;
  apiClient: ApiClient;
  accessibilityHelper: AccessibilityHelper;
  performanceHelper: PerformanceHelper;
  allureHelper: AllureHelper;
  mobileHelper: MobileHelper;
  testData: TestData;
  examplePage: ExamplePage;
}

/**
 * Worker-scoped fixtures for shared resources
 */
export interface WorkerFixtures {
  workerStorageState: string;
  workerLogger: Logger;
}

/**
 * Extended test with comprehensive fixtures
 */
export const test = baseTest.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped fixtures
  workerStorageState: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Perform any global authentication or setup here
      // This runs once per worker
      
      const storageState = await context.storageState();
      await context.close();
      
      await use(JSON.stringify(storageState));
    },
    { scope: 'worker' }
  ],

  workerLogger: [
    async ({}, use) => {
      const logger = new Logger();
      logger.info('Worker started');
      await use(logger);
      logger.info('Worker finished');
    },
    { scope: 'worker' }
  ],

  // Test-scoped fixtures
  logger: async ({ workerLogger }, use, testInfo) => {
    const logger = new Logger();
    logger.startTest(testInfo.title);
    
    await use(logger);
    
    const status = testInfo.status === 'passed' ? 'PASSED' : 
                  testInfo.status === 'failed' ? 'FAILED' : 'SKIPPED';
    logger.endTest(testInfo.title, status);
  },

  screenshotHelper: async ({ page }, use) => {
    const screenshotHelper = new ScreenshotHelper(page);
    await use(screenshotHelper);
  },

  videoHelper: async ({ page }, use) => {
    const videoHelper = new VideoHelper(page);
    await use(videoHelper);
  },

  apiClient: async ({}, use) => {
    const apiClient = new ApiClient();
    await apiClient.init();
    await use(apiClient);
    await apiClient.dispose();
  },

  accessibilityHelper: async ({ page }, use) => {
    const accessibilityHelper = new AccessibilityHelper(page);
    await use(accessibilityHelper);
  },

  performanceHelper: async ({ page }, use) => {
    const performanceHelper = new PerformanceHelper(page);
    await use(performanceHelper);
  },

  allureHelper: async ({ page }, use, testInfo) => {
    const allureHelper = new AllureHelper();
    await allureHelper.startTest(testInfo.title);
    await use(allureHelper);
    await allureHelper.endTest(testInfo.status === 'passed');
  },

  mobileHelper: async ({ page, context }, use) => {
    const mobileHelper = new MobileHelper(page, context);
    await use(mobileHelper);
  },

  testData: async ({}, use) => {
    const testData = TestData.getInstance();
    await use(testData);
  },

  examplePage: async ({ page }, use) => {
    const examplePage = new ExamplePage(page);
    await use(examplePage);
  },
});

/**
 * Authenticated test fixture with login state
 */
export const authenticatedTest = test.extend<{ 
  authenticatedPage: ExamplePage;
  userCredentials: { username: string; password: string };
}>({
  userCredentials: async ({}, use) => {
    // Get test user credentials from config
    const credentials = {
      username: testConfig.username,
      password: testConfig.password,
    };
    await use(credentials);
  },

  authenticatedPage: async ({ page, userCredentials }, use) => {
    const examplePage = new ExamplePage(page);
    
    // Navigate to the application
    await examplePage.navigate();
    
    // Perform login
    await examplePage.login(userCredentials.username, userCredentials.password);
    
    await use(examplePage);
  },
});

/**
 * API test fixture with authenticated API client
 */
export const apiTest = test.extend<{
  authenticatedApiClient: ApiClient;
}>({
  authenticatedApiClient: async ({}, use) => {
    const apiClient = new ApiClient(testConfig.apiBaseUrl);
    await apiClient.init();
    
    // Set API key or token
    apiClient.setApiKey(testConfig.apiKey);
    
    await use(apiClient);
    await apiClient.dispose();
  },
});

/**
 * Performance test fixture with performance monitoring
 */
export const performanceTest = test.extend<{
  performanceMonitor: PerformanceHelper;
}>({
  performanceMonitor: async ({ page }, use) => {
    const performanceHelper = new PerformanceHelper(page);
    await performanceHelper.startMonitoring();
    await use(performanceHelper);
    await performanceHelper.stopMonitoring();
  },
});

/**
 * Accessibility test fixture with a11y scanning
 */
export const accessibilityTest = test.extend<{
  accessibilityScanner: AccessibilityHelper;
}>({
  accessibilityScanner: async ({ page }, use) => {
    const accessibilityHelper = new AccessibilityHelper(page);
    await accessibilityHelper.initialize();
    await use(accessibilityHelper);
  },
});

/**
 * Visual regression test fixture
 */
export const visualTest = test.extend<{
  visualHelper: ScreenshotHelper;
}>({
  visualHelper: async ({ page }, use) => {
    const screenshotHelper = new ScreenshotHelper(page);
    await use(screenshotHelper);
  },
});

/**
 * Mobile test fixture with device emulation
 */
export const mobileTest = test.extend<{
  mobileDevice: string;
}>({
  mobileDevice: ['iPhone 12', { option: true }],
});

/**
 * Database test fixture (if needed for integration tests)
 */
export const databaseTest = test.extend<{
  dbConnection: any;
}>({
  dbConnection: async ({}, use) => {
    // Initialize database connection
    // This would depend on your database setup
    const dbConnection = null; // Replace with actual DB connection
    await use(dbConnection);
    // Close connection
  },
});

/**
 * Test hooks and utilities
 */
export class TestHooks {
  /**
   * Before each test hook
   */
  static async beforeEach(testInfo: any, fixtures: TestFixtures): Promise<void> {
    fixtures.logger.info(`Starting test: ${testInfo.title}`);
    
    // Set up test environment
    await fixtures.allureHelper.addTestInfo(testInfo);
    
    // Clear browser storage if needed
    // await fixtures.page.evaluate(() => {
    //   localStorage.clear();
    //   sessionStorage.clear();
    // });
  }

  /**
   * After each test hook
   */
  static async afterEach(testInfo: any, fixtures: TestFixtures): Promise<void> {
    // Take screenshot on failure
    if (testInfo.status === 'failed') {
      await fixtures.screenshotHelper.takeFailureScreenshot();
      await fixtures.videoHelper.saveFailureVideo();
    }

    // Attach artifacts to Allure
    await fixtures.allureHelper.attachArtifacts(testInfo);
    
    fixtures.logger.info(`Test completed: ${testInfo.title} - ${testInfo.status}`);
  }
}

/**
 * Test data providers
 */
export class TestDataProviders {
  /**
   * Get test users for parameterized tests
   */
  static getTestUsers(): Array<{ username: string; password: string; role: string }> {
    return [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' },
      { username: 'guest', password: 'guest123', role: 'guest' },
    ];
  }

  /**
   * Get test browsers for cross-browser testing
   */
  static getTestBrowsers(): string[] {
    return testConfig.browsers;
  }

  /**
   * Get test environments
   */
  static getTestEnvironments(): string[] {
    return ['development', 'staging', 'production'];
  }
}

/**
 * Custom assertions
 */
export class CustomAssertions {
  /**
   * Assert element is visible within timeout
   */
  static async assertElementVisible(page: any, selector: string, timeout: number = 5000): Promise<void> {
    await expect(page.locator(selector)).toBeVisible({ timeout });
  }

  /**
   * Assert element contains text
   */
  static async assertElementContainsText(page: any, selector: string, text: string): Promise<void> {
    await expect(page.locator(selector)).toContainText(text);
  }

  /**
   * Assert API response status
   */
  static assertApiResponseStatus(response: any, expectedStatus: number): void {
    expect(response.status).toBe(expectedStatus);
  }

  /**
   * Assert response time is within limits
   */
  static assertResponseTime(duration: number, maxDuration: number): void {
    expect(duration).toBeLessThan(maxDuration);
  }
}

export { expect };
