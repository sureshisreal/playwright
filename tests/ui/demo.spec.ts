import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('Demo Test Suite', () => {
  test('should demonstrate framework capabilities', async ({ page, logger, allureHelper }) => {
    // Add test metadata
    await allureHelper.addDescription('Demo test to showcase framework capabilities');
    await allureHelper.addTags(['demo', 'framework', 'example']);
    await allureHelper.addSeverity('normal');
    
    // Navigate to a real website for testing
    await allureHelper.addStep('Navigate to example.com', async () => {
      await page.goto('https://example.com');
      logger.info('Successfully navigated to example.com');
    });

    // Verify page elements
    await allureHelper.addStep('Verify page title', async () => {
      await expect(page).toHaveTitle(/Example Domain/);
      logger.info('Page title verified successfully');
    });

    // Check for specific elements
    await allureHelper.addStep('Verify page content', async () => {
      const heading = page.locator('h1');
      await expect(heading).toContainText('Example Domain');
      logger.info('Page heading verified');
    });

    // Test clicking functionality
    await allureHelper.addStep('Test page interactions', async () => {
      const moreInfoLink = page.locator('a[href="https://www.iana.org/domains/example"]');
      await expect(moreInfoLink).toBeVisible();
      logger.info('More info link is visible');
    });

    logger.info('Demo test completed successfully');
  });

  test('should demonstrate performance monitoring', async ({ page, performanceHelper, allureHelper }) => {
    await allureHelper.addDescription('Test to demonstrate performance monitoring');
    await allureHelper.addTags(['performance', 'monitoring', 'demo']);
    
    // Start performance monitoring
    await performanceHelper.startMonitoring();
    
    // Navigate to page
    await page.goto('https://example.com');
    
    // Get performance metrics
    const metrics = await performanceHelper.getMetrics();
    
    // Verify metrics were collected
    expect(metrics.loadTime).toBeGreaterThan(0);
    expect(metrics.url).toBe('https://example.com');
    
    // Add performance report
    await allureHelper.addPerformanceReportAttachment(metrics, 'Performance Metrics');
  });
});