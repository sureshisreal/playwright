import { test } from '../fixtures/test-fixtures';
import { expect } from '@playwright/test';

/**
 * Base test template with common patterns
 */
export class BaseTestTemplate {
  /**
   * Standard test setup with navigation and validation
   */
  static async standardSetup(page: any, url: string, title: string) {
    await page.goto(url);
    await expect(page).toHaveTitle(new RegExp(title, 'i'));
    await page.waitForLoadState('networkidle');
  }

  /**
   * Common form filling pattern
   */
  static async fillForm(page: any, formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await page.fill(selector, value);
    }
  }

  /**
   * Common button click with validation
   */
  static async clickAndValidate(page: any, buttonSelector: string, expectedSelector: string) {
    await page.click(buttonSelector);
    await expect(page.locator(expectedSelector)).toBeVisible();
  }

  /**
   * Common API response validation
   */
  static validateApiResponse(response: any, expectedStatus: number = 200) {
    expect(response.status()).toBe(expectedStatus);
    expect(response.headers()['content-type']).toContain('application/json');
  }

  /**
   * Common mobile device setup
   */
  static async setupMobileDevice(mobileHelper: any, deviceName: string) {
    await mobileHelper.setDevice(deviceName);
    await mobileHelper.setViewport(375, 667); // Standard mobile viewport
  }

  /**
   * Common accessibility validation
   */
  static async validateAccessibility(accessibilityHelper: any, expectedViolations: number = 0) {
    const results = await accessibilityHelper.runAccessibilityScan();
    expect(results.violations).toHaveLength(expectedViolations);
  }

  /**
   * Common performance validation
   */
  static async validatePerformance(performanceHelper: any, maxLoadTime: number = 3000) {
    const metrics = await performanceHelper.getPerformanceMetrics();
    expect(metrics.loadTime).toBeLessThan(maxLoadTime);
  }
}