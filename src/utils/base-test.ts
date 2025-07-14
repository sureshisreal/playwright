import { test as baseTest, expect } from '@playwright/test';
import { Logger } from './logger';
import { ScreenshotHelper } from './screenshot-helper';
import { VideoHelper } from './video-helper';
import { ApiClient } from './api-client';
import { testConfig } from '../config/test-config';
import { AllureHelper } from '../helpers/allure-helper';

/**
 * Extended base test with custom fixtures and utilities
 */
export interface TestFixtures {
  logger: Logger;
  screenshotHelper: ScreenshotHelper;
  videoHelper: VideoHelper;
  apiClient: ApiClient;
  allureHelper: AllureHelper;
}

export const test = baseTest.extend<TestFixtures>({
  logger: async ({}, use) => {
    const logger = new Logger();
    await use(logger);
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
    const apiClient = new ApiClient(testConfig.apiBaseUrl);
    await use(apiClient);
  },

  allureHelper: async ({ page }, use) => {
    const allureHelper = new AllureHelper();
    await use(allureHelper);
  },
});

/**
 * Base test class with common functionality
 */
export class BaseTest {
  protected logger: Logger;
  protected screenshotHelper: ScreenshotHelper;
  protected videoHelper: VideoHelper;
  protected apiClient: ApiClient;
  protected allureHelper: AllureHelper;

  constructor(fixtures: TestFixtures) {
    this.logger = fixtures.logger;
    this.screenshotHelper = fixtures.screenshotHelper;
    this.videoHelper = fixtures.videoHelper;
    this.apiClient = fixtures.apiClient;
    this.allureHelper = fixtures.allureHelper;
  }

  /**
   * Setup method to be called before each test
   */
  async setup(): Promise<void> {
    this.logger.info('Setting up test');
    await this.allureHelper.addEnvironmentInfo();
  }

  /**
   * Teardown method to be called after each test
   */
  async teardown(): Promise<void> {
    this.logger.info('Tearing down test');
  }

  /**
   * Wait for element to be visible and interactable
   */
  async waitForElement(page: any, selector: string, timeout: number = testConfig.timeout): Promise<void> {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      this.logger.debug(`Element ${selector} is visible`);
    } catch (error) {
      this.logger.error(`Element ${selector} not found within ${timeout}ms`);
      throw error;
    }
  }

  /**
   * Safe click with wait and logging
   */
  async safeClick(page: any, selector: string): Promise<void> {
    try {
      await this.waitForElement(page, selector);
      await page.click(selector);
      this.logger.debug(`Clicked element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to click element: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`failed_click_${selector}`);
      throw error;
    }
  }

  /**
   * Safe type with wait and logging
   */
  async safeType(page: any, selector: string, text: string): Promise<void> {
    try {
      await this.waitForElement(page, selector);
      await page.fill(selector, text);
      this.logger.debug(`Typed text into element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to type into element: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`failed_type_${selector}`);
      throw error;
    }
  }

  /**
   * Get element text with wait and logging
   */
  async getElementText(page: any, selector: string): Promise<string> {
    try {
      await this.waitForElement(page, selector);
      const text = await page.textContent(selector);
      this.logger.debug(`Got text from element ${selector}: ${text}`);
      return text || '';
    } catch (error) {
      this.logger.error(`Failed to get text from element: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`failed_get_text_${selector}`);
      throw error;
    }
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(page: any): Promise<void> {
    await page.waitForLoadState('networkidle');
    this.logger.debug('Page loaded completely');
  }

  /**
   * Navigate to URL with error handling
   */
  async navigateToUrl(page: any, url: string): Promise<void> {
    try {
      await page.goto(url);
      await this.waitForPageLoad(page);
      this.logger.info(`Navigated to: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to navigate to: ${url}`);
      throw error;
    }
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(page: any, selector: string): Promise<void> {
    try {
      await expect(page.locator(selector)).toBeVisible();
      this.logger.debug(`Element ${selector} is visible`);
    } catch (error) {
      this.logger.error(`Element ${selector} is not visible`);
      await this.screenshotHelper.takeScreenshot(`element_not_visible_${selector}`);
      throw error;
    }
  }

  /**
   * Verify element contains text
   */
  async verifyElementText(page: any, selector: string, expectedText: string): Promise<void> {
    try {
      await expect(page.locator(selector)).toContainText(expectedText);
      this.logger.debug(`Element ${selector} contains text: ${expectedText}`);
    } catch (error) {
      this.logger.error(`Element ${selector} does not contain text: ${expectedText}`);
      await this.screenshotHelper.takeScreenshot(`text_verification_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Handle alerts/dialogs
   */
  async handleAlert(page: any, action: 'accept' | 'dismiss' = 'accept'): Promise<void> {
    page.on('dialog', async (dialog: any) => {
      this.logger.info(`Dialog appeared: ${dialog.message()}`);
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Switch to frame/iframe
   */
  async switchToFrame(page: any, frameSelector: string): Promise<any> {
    try {
      const frame = await page.frame({ name: frameSelector }) || await page.frameLocator(frameSelector);
      this.logger.debug(`Switched to frame: ${frameSelector}`);
      return frame;
    } catch (error) {
      this.logger.error(`Failed to switch to frame: ${frameSelector}`);
      throw error;
    }
  }

  /**
   * Upload file
   */
  async uploadFile(page: any, selector: string, filePath: string): Promise<void> {
    try {
      await page.setInputFiles(selector, filePath);
      this.logger.debug(`Uploaded file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${filePath}`);
      throw error;
    }
  }

  /**
   * Scroll to element
   */
  async scrollToElement(page: any, selector: string): Promise<void> {
    try {
      await page.locator(selector).scrollIntoViewIfNeeded();
      this.logger.debug(`Scrolled to element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to scroll to element: ${selector}`);
      throw error;
    }
  }

  /**
   * Wait for network response
   */
  async waitForResponse(page: any, urlPattern: string | RegExp): Promise<any> {
    try {
      const response = await page.waitForResponse(urlPattern);
      this.logger.debug(`Received response for: ${urlPattern}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to receive response for: ${urlPattern}`);
      throw error;
    }
  }

  /**
   * Get network requests
   */
  async captureNetworkRequests(page: any): Promise<any[]> {
    const requests: any[] = [];
    page.on('request', (request: any) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: Date.now(),
      });
    });
    return requests;
  }

  /**
   * Clear browser storage
   */
  async clearBrowserStorage(page: any): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    this.logger.debug('Browser storage cleared');
  }

  /**
   * Set browser storage
   */
  async setBrowserStorage(page: any, key: string, value: string, type: 'localStorage' | 'sessionStorage' = 'localStorage'): Promise<void> {
    await page.evaluate(({ key, value, type }) => {
      if (type === 'localStorage') {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
      }
    }, { key, value, type });
    this.logger.debug(`Set ${type}: ${key} = ${value}`);
  }
}

export { expect };
