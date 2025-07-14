import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/logger';
import { ScreenshotHelper } from '../utils/screenshot-helper';
import { testConfig } from '../config/test-config';

/**
 * Base page class with common functionality for all pages
 */
export class BasePage {
  protected page: Page;
  protected logger: Logger;
  protected screenshotHelper: ScreenshotHelper;
  protected url: string;
  protected pageTitle: string;

  constructor(page: Page, url: string = '', pageTitle: string = '') {
    this.page = page;
    this.logger = new Logger();
    this.screenshotHelper = new ScreenshotHelper(page);
    this.url = url;
    this.pageTitle = pageTitle;
  }

  /**
   * Navigate to page
   */
  async navigate(): Promise<void> {
    try {
      await this.page.goto(this.url);
      await this.waitForPageLoad();
      this.logger.info(`Navigated to: ${this.url}`);
    } catch (error) {
      this.logger.error(`Failed to navigate to ${this.url}: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    this.logger.debug('Page loaded completely');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Verify page title
   */
  async verifyTitle(expectedTitle?: string): Promise<void> {
    const title = await this.getTitle();
    const expected = expectedTitle || this.pageTitle;
    
    if (title !== expected) {
      this.logger.error(`Page title mismatch. Expected: ${expected}, Got: ${title}`);
      throw new Error(`Page title mismatch. Expected: ${expected}, Got: ${title}`);
    }
    
    this.logger.debug(`Page title verified: ${title}`);
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Verify current URL
   */
  async verifyUrl(expectedUrl?: string): Promise<void> {
    const currentUrl = this.getCurrentUrl();
    const expected = expectedUrl || this.url;
    
    if (!currentUrl.includes(expected)) {
      this.logger.error(`URL mismatch. Expected: ${expected}, Got: ${currentUrl}`);
      throw new Error(`URL mismatch. Expected: ${expected}, Got: ${currentUrl}`);
    }
    
    this.logger.debug(`URL verified: ${currentUrl}`);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = testConfig.timeout): Promise<Locator> {
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout });
      this.logger.debug(`Element visible: ${selector}`);
      return locator;
    } catch (error) {
      this.logger.error(`Element not found: ${selector}`);
      throw error;
    }
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToBeHidden(selector: string, timeout: number = testConfig.timeout): Promise<void> {
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: 'hidden', timeout });
      this.logger.debug(`Element hidden: ${selector}`);
    } catch (error) {
      this.logger.error(`Element still visible: ${selector}`);
      throw error;
    }
  }

  /**
   * Click element with wait
   */
  async click(selector: string): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.click();
      this.logger.debug(`Clicked: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to click: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`click_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Double click element
   */
  async doubleClick(selector: string): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.dblclick();
      this.logger.debug(`Double clicked: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to double click: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`double_click_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Right click element
   */
  async rightClick(selector: string): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.click({ button: 'right' });
      this.logger.debug(`Right clicked: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to right click: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`right_click_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Type text into element
   */
  async type(selector: string, text: string, delay: number = 0): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.fill(text);
      if (delay > 0) {
        await locator.type(text, { delay });
      }
      this.logger.debug(`Typed "${text}" into: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to type into: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`type_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Clear and type text
   */
  async clearAndType(selector: string, text: string): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.clear();
      await locator.fill(text);
      this.logger.debug(`Cleared and typed "${text}" into: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to clear and type into: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`clear_type_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Get text content of element
   */
  async getText(selector: string): Promise<string> {
    try {
      const locator = await this.waitForElement(selector);
      const text = await locator.textContent();
      this.logger.debug(`Got text from ${selector}: "${text}"`);
      return text || '';
    } catch (error) {
      this.logger.error(`Failed to get text from: ${selector}`);
      throw error;
    }
  }

  /**
   * Get inner text of element
   */
  async getInnerText(selector: string): Promise<string> {
    try {
      const locator = await this.waitForElement(selector);
      const text = await locator.innerText();
      this.logger.debug(`Got inner text from ${selector}: "${text}"`);
      return text || '';
    } catch (error) {
      this.logger.error(`Failed to get inner text from: ${selector}`);
      throw error;
    }
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector: string, attribute: string): Promise<string> {
    try {
      const locator = await this.waitForElement(selector);
      const value = await locator.getAttribute(attribute);
      this.logger.debug(`Got attribute ${attribute} from ${selector}: "${value}"`);
      return value || '';
    } catch (error) {
      this.logger.error(`Failed to get attribute ${attribute} from: ${selector}`);
      throw error;
    }
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      const locator = this.page.locator(selector);
      const isVisible = await locator.isVisible();
      this.logger.debug(`Element ${selector} visibility: ${isVisible}`);
      return isVisible;
    } catch (error) {
      this.logger.error(`Failed to check visibility of: ${selector}`);
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector: string): Promise<boolean> {
    try {
      const locator = this.page.locator(selector);
      const isEnabled = await locator.isEnabled();
      this.logger.debug(`Element ${selector} enabled: ${isEnabled}`);
      return isEnabled;
    } catch (error) {
      this.logger.error(`Failed to check if element is enabled: ${selector}`);
      return false;
    }
  }

  /**
   * Check if element is checked (for checkboxes/radio buttons)
   */
  async isChecked(selector: string): Promise<boolean> {
    try {
      const locator = this.page.locator(selector);
      const isChecked = await locator.isChecked();
      this.logger.debug(`Element ${selector} checked: ${isChecked}`);
      return isChecked;
    } catch (error) {
      this.logger.error(`Failed to check if element is checked: ${selector}`);
      return false;
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, option: string | number): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.selectOption(option.toString());
      this.logger.debug(`Selected option "${option}" from: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to select option "${option}" from: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`select_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.setInputFiles(filePath);
      this.logger.debug(`Uploaded file "${filePath}" to: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to upload file "${filePath}" to: ${selector}`);
      await this.screenshotHelper.takeScreenshot(`upload_failed_${selector}`);
      throw error;
    }
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    try {
      const locator = this.page.locator(selector);
      await locator.scrollIntoViewIfNeeded();
      this.logger.debug(`Scrolled to element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to scroll to element: ${selector}`);
      throw error;
    }
  }

  /**
   * Scroll to top of page
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    this.logger.debug('Scrolled to top of page');
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    this.logger.debug('Scrolled to bottom of page');
  }

  /**
   * Hover over element
   */
  async hover(selector: string): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.hover();
      this.logger.debug(`Hovered over: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to hover over: ${selector}`);
      throw error;
    }
  }

  /**
   * Focus on element
   */
  async focus(selector: string): Promise<void> {
    try {
      const locator = await this.waitForElement(selector);
      await locator.focus();
      this.logger.debug(`Focused on: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to focus on: ${selector}`);
      throw error;
    }
  }

  /**
   * Press key
   */
  async pressKey(key: string): Promise<void> {
    try {
      await this.page.keyboard.press(key);
      this.logger.debug(`Pressed key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to press key: ${key}`);
      throw error;
    }
  }

  /**
   * Press key combination
   */
  async pressKeyCombination(keys: string[]): Promise<void> {
    try {
      const combination = keys.join('+');
      await this.page.keyboard.press(combination);
      this.logger.debug(`Pressed key combination: ${combination}`);
    } catch (error) {
      this.logger.error(`Failed to press key combination: ${keys.join('+')}`);
      throw error;
    }
  }

  /**
   * Wait for timeout
   */
  async waitFor(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
    this.logger.debug(`Waited for ${milliseconds}ms`);
  }

  /**
   * Wait for network response
   */
  async waitForResponse(urlPattern: string | RegExp): Promise<any> {
    try {
      const response = await this.page.waitForResponse(urlPattern);
      this.logger.debug(`Received response for: ${urlPattern}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to receive response for: ${urlPattern}`);
      throw error;
    }
  }

  /**
   * Wait for network request
   */
  async waitForRequest(urlPattern: string | RegExp): Promise<any> {
    try {
      const request = await this.page.waitForRequest(urlPattern);
      this.logger.debug(`Received request for: ${urlPattern}`);
      return request;
    } catch (error) {
      this.logger.error(`Failed to receive request for: ${urlPattern}`);
      throw error;
    }
  }

  /**
   * Get all elements matching selector
   */
  async getAllElements(selector: string): Promise<Locator[]> {
    try {
      const locators = await this.page.locator(selector).all();
      this.logger.debug(`Found ${locators.length} elements for: ${selector}`);
      return locators;
    } catch (error) {
      this.logger.error(`Failed to get elements for: ${selector}`);
      throw error;
    }
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    try {
      const count = await this.page.locator(selector).count();
      this.logger.debug(`Element count for ${selector}: ${count}`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to get element count for: ${selector}`);
      throw error;
    }
  }

  /**
   * Handle alert/confirm dialog
   */
  async handleDialog(action: 'accept' | 'dismiss' = 'accept', text?: string): Promise<void> {
    this.page.once('dialog', async dialog => {
      this.logger.info(`Dialog appeared: ${dialog.message()}`);
      if (action === 'accept') {
        await dialog.accept(text);
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Execute JavaScript
   */
  async executeScript(script: string, ...args: any[]): Promise<any> {
    try {
      const result = await this.page.evaluate(script, ...args);
      this.logger.debug(`Executed script: ${script}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute script: ${script}`);
      throw error;
    }
  }

  /**
   * Get page source
   */
  async getPageSource(): Promise<string> {
    return await this.page.content();
  }

  /**
   * Refresh page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
    this.logger.debug('Page refreshed');
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
    this.logger.debug('Navigated back');
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
    this.logger.debug('Navigated forward');
  }

  /**
   * Close current page
   */
  async closePage(): Promise<void> {
    await this.page.close();
    this.logger.debug('Page closed');
  }
}
