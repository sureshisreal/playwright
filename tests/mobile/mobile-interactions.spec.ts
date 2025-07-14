import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';
import { MobileHelper } from '../../src/helpers/mobile-helper';

test.describe('Mobile Interactions Test Suite', () => {
  let mobileHelper: MobileHelper;

  test.beforeEach(async ({ page, context }) => {
    mobileHelper = new MobileHelper(page, context);
  });

  test('should test touch interactions on mobile', async ({ page, allureHelper }) => {
    await allureHelper.addDescription('Test touch interactions on mobile devices');
    await allureHelper.addTags(['mobile', 'touch', 'interactions']);
    
    await allureHelper.addStep('Set iPhone 13 device emulation', async () => {
      await mobileHelper.setDevice('iPhone 13');
    });

    await allureHelper.addStep('Navigate to test page', async () => {
      await page.goto('https://example.com');
    });

    await allureHelper.addStep('Test tap interaction', async () => {
      const link = page.locator('a');
      await mobileHelper.tap('a');
      await expect(link).toBeVisible();
    });

    await allureHelper.addStep('Test device rotation', async () => {
      await mobileHelper.rotateDevice();
      const deviceInfo = await mobileHelper.getDeviceInfo();
      expect(deviceInfo.viewport.width).toBeGreaterThan(deviceInfo.viewport.height);
    });

    await allureHelper.addStep('Take mobile screenshot', async () => {
      const screenshotPath = await mobileHelper.takeScreenshot('mobile-interaction-test');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Mobile Screenshot');
    });
  });

  test('should test responsive breakpoints', async ({ page, allureHelper }) => {
    await allureHelper.addDescription('Test responsive design across different breakpoints');
    await allureHelper.addTags(['mobile', 'responsive', 'breakpoints']);
    
    await page.goto('https://example.com');

    await allureHelper.addStep('Test responsive breakpoints', async () => {
      await mobileHelper.testResponsiveBreakpoints(async (breakpoint) => {
        const deviceInfo = await mobileHelper.getDeviceInfo();
        expect(deviceInfo.viewport.width).toBe(breakpoint.width);
        
        // Take screenshot for each breakpoint
        await mobileHelper.takeScreenshot(`responsive-${breakpoint.name}`);
      });
    });
  });

  test('should test swipe gestures', async ({ page, allureHelper }) => {
    await allureHelper.addDescription('Test swipe gestures on mobile devices');
    await allureHelper.addTags(['mobile', 'swipe', 'gestures']);
    
    await mobileHelper.setDevice('Samsung Galaxy S21');
    await page.goto('https://example.com');

    await allureHelper.addStep('Test swipe by coordinates', async () => {
      await mobileHelper.swipeByCoordinates(100, 400, 300, 400);
    });

    await allureHelper.addStep('Test pinch zoom', async () => {
      await mobileHelper.pinchZoom(200, 300, 1.5);
    });
  });

  test('should test different mobile devices', async ({ page, allureHelper }) => {
    await allureHelper.addDescription('Test application across different mobile devices');
    await allureHelper.addTags(['mobile', 'devices', 'compatibility']);
    
    const devices = ['iPhone 13', 'Samsung Galaxy S21', 'iPad Air', 'Google Pixel 6'];
    
    for (const deviceName of devices) {
      await allureHelper.addStep(`Test on ${deviceName}`, async () => {
        await mobileHelper.setDevice(deviceName);
        await page.goto('https://example.com');
        
        const deviceInfo = await mobileHelper.getDeviceInfo();
        expect(deviceInfo.touchSupport).toBe(true);
        
        await mobileHelper.takeScreenshot(`device-${deviceName.toLowerCase().replace(/\s+/g, '-')}`);
      });
    }
  });

  test('should test viewport visibility', async ({ page, allureHelper }) => {
    await allureHelper.addDescription('Test element visibility in mobile viewport');
    await allureHelper.addTags(['mobile', 'viewport', 'visibility']);
    
    await mobileHelper.setDevice('iPhone SE');
    await page.goto('https://example.com');

    await allureHelper.addStep('Check element visibility', async () => {
      const isVisible = await mobileHelper.isElementInViewport('h1');
      expect(isVisible).toBe(true);
    });

    await allureHelper.addStep('Scroll element into view', async () => {
      await mobileHelper.scrollIntoView('a');
      const isLinkVisible = await mobileHelper.isElementInViewport('a');
      expect(isLinkVisible).toBe(true);
    });
  });
});