import { Page, Browser, BrowserContext } from '@playwright/test';
import { Logger } from '../utils/logger';
import { MobileDevice, mobileConfig } from '../config/mobile-config';

/**
 * Mobile testing helper with device emulation and touch interactions
 */
export class MobileHelper {
  private page: Page;
  private logger: Logger;
  private currentDevice: MobileDevice | null = null;
  private context: BrowserContext | null = null;

  constructor(page: Page, context?: BrowserContext) {
    this.page = page;
    this.context = context || null;
    this.logger = new Logger();
  }

  /**
   * Set device emulation
   */
  async setDevice(deviceName: string): Promise<void> {
    const device = mobileConfig.getDevice(deviceName);
    if (!device) {
      throw new Error(`Device ${deviceName} not found`);
    }

    this.currentDevice = device;
    
    // Set viewport
    await this.page.setViewportSize(device.viewport);
    
    // Set user agent
    await this.page.setExtraHTTPHeaders({
      'User-Agent': device.userAgent
    });
    
    // Set device scale factor if context is available
    if (this.context) {
      await this.context.addInitScript(`
        Object.defineProperty(window, 'devicePixelRatio', {
          get() { return ${device.deviceScaleFactor}; }
        });
      `);
    }
    
    this.logger.info(`Device emulation set to: ${deviceName}`);
  }

  /**
   * Set custom device configuration
   */
  async setCustomDevice(device: MobileDevice): Promise<void> {
    this.currentDevice = device;
    
    await this.page.setViewportSize(device.viewport);
    await this.page.setExtraHTTPHeaders({
      'User-Agent': device.userAgent
    });
    
    if (this.context) {
      await this.context.addInitScript(`
        Object.defineProperty(window, 'devicePixelRatio', {
          get() { return ${device.deviceScaleFactor}; }
        });
      `);
    }
    
    this.logger.info(`Custom device emulation set: ${device.name}`);
  }

  /**
   * Rotate device orientation
   */
  async rotateDevice(): Promise<void> {
    if (!this.currentDevice) {
      throw new Error('No device set for rotation');
    }
    
    const rotatedDevice = mobileConfig.getLandscapeOrientation(this.currentDevice);
    await this.setCustomDevice(rotatedDevice);
    
    this.logger.info(`Device rotated to: ${rotatedDevice.orientation}`);
  }

  /**
   * Perform touch tap
   */
  async tap(selector: string, options?: { force?: boolean; timeout?: number }): Promise<void> {
    const element = this.page.locator(selector);
    await element.tap(options);
    this.logger.info(`Tapped on: ${selector}`);
  }

  /**
   * Perform double tap
   */
  async doubleTap(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.dblclick();
    this.logger.info(`Double tapped on: ${selector}`);
  }

  /**
   * Perform touch swipe
   */
  async swipe(
    fromSelector: string,
    toSelector: string,
    options?: { steps?: number; duration?: number }
  ): Promise<void> {
    const fromElement = this.page.locator(fromSelector);
    const toElement = this.page.locator(toSelector);
    
    const fromBox = await fromElement.boundingBox();
    const toBox = await toElement.boundingBox();
    
    if (!fromBox || !toBox) {
      throw new Error('Elements not found for swipe');
    }
    
    const steps = options?.steps || 10;
    const duration = options?.duration || 1000;
    
    await this.page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
    await this.page.mouse.down();
    
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const x = fromBox.x + (toBox.x - fromBox.x) * progress + fromBox.width / 2;
      const y = fromBox.y + (toBox.y - fromBox.y) * progress + fromBox.height / 2;
      
      await this.page.mouse.move(x, y);
      await this.page.waitForTimeout(duration / steps);
    }
    
    await this.page.mouse.up();
    this.logger.info(`Swiped from ${fromSelector} to ${toSelector}`);
  }

  /**
   * Perform swipe gesture by coordinates
   */
  async swipeByCoordinates(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    options?: { steps?: number; duration?: number }
  ): Promise<void> {
    const steps = options?.steps || 10;
    const duration = options?.duration || 1000;
    
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      await this.page.mouse.move(x, y);
      await this.page.waitForTimeout(duration / steps);
    }
    
    await this.page.mouse.up();
    this.logger.info(`Swiped from (${startX}, ${startY}) to (${endX}, ${endY})`);
  }

  /**
   * Perform pinch zoom
   */
  async pinchZoom(
    centerX: number,
    centerY: number,
    scale: number,
    options?: { duration?: number }
  ): Promise<void> {
    const duration = options?.duration || 1000;
    
    // Simulate pinch zoom using touch events
    await this.page.evaluate(({ centerX, centerY, scale, duration }) => {
      const touches = [
        { clientX: centerX - 50, clientY: centerY, identifier: 0 },
        { clientX: centerX + 50, clientY: centerY, identifier: 1 }
      ];
      
      // Start touch
      const touchStart = new TouchEvent('touchstart', {
        touches: touches,
        changedTouches: touches
      });
      document.dispatchEvent(touchStart);
      
      // Move touches to zoom
      setTimeout(() => {
        const newTouches = [
          { clientX: centerX - (50 * scale), clientY: centerY, identifier: 0 },
          { clientX: centerX + (50 * scale), clientY: centerY, identifier: 1 }
        ];
        
        const touchMove = new TouchEvent('touchmove', {
          touches: newTouches,
          changedTouches: newTouches
        });
        document.dispatchEvent(touchMove);
      }, duration / 2);
      
      // End touch
      setTimeout(() => {
        const touchEnd = new TouchEvent('touchend', {
          touches: [],
          changedTouches: touches
        });
        document.dispatchEvent(touchEnd);
      }, duration);
    }, { centerX, centerY, scale, duration });
    
    this.logger.info(`Pinch zoom performed at (${centerX}, ${centerY}) with scale ${scale}`);
  }

  /**
   * Simulate device shake
   */
  async shakeDevice(): Promise<void> {
    await this.page.evaluate(() => {
      // Simulate device motion event
      const event = new DeviceMotionEvent('devicemotion', {
        acceleration: { x: 10, y: 10, z: 10 },
        accelerationIncludingGravity: { x: 10, y: 10, z: 10 },
        rotationRate: { alpha: 0, beta: 0, gamma: 0 },
        interval: 16
      });
      
      window.dispatchEvent(event);
    });
    
    this.logger.info('Device shake simulated');
  }

  /**
   * Test responsive breakpoints
   */
  async testResponsiveBreakpoints(
    testFunction: (breakpoint: { name: string; width: number }) => Promise<void>
  ): Promise<void> {
    const breakpoints = mobileConfig.getResponsiveBreakpoints();
    
    for (const breakpoint of breakpoints) {
      this.logger.info(`Testing breakpoint: ${breakpoint.name} (${breakpoint.width}px)`);
      
      await this.page.setViewportSize({
        width: breakpoint.width,
        height: 800 // Standard height for testing
      });
      
      await testFunction(breakpoint);
    }
  }

  /**
   * Check if element is visible in viewport
   */
  async isElementInViewport(selector: string): Promise<boolean> {
    const isVisible = await this.page.locator(selector).evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= viewport.height &&
        rect.right <= viewport.width
      );
    });
    
    return isVisible;
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    this.logger.info(`Scrolled ${selector} into view`);
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<{
    viewport: { width: number; height: number };
    userAgent: string;
    devicePixelRatio: number;
    touchSupport: boolean;
  }> {
    const viewport = this.page.viewportSize();
    const userAgent = await this.page.evaluate(() => navigator.userAgent);
    const devicePixelRatio = await this.page.evaluate(() => window.devicePixelRatio);
    const touchSupport = await this.page.evaluate(() => 'ontouchstart' in window);
    
    return {
      viewport: viewport || { width: 0, height: 0 },
      userAgent,
      devicePixelRatio,
      touchSupport
    };
  }

  /**
   * Take screenshot optimized for mobile
   */
  async takeScreenshot(
    name: string,
    options?: {
      fullPage?: boolean;
      clip?: { x: number; y: number; width: number; height: number };
    }
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const deviceName = this.currentDevice?.name || 'unknown-device';
    const filename = `mobile_${deviceName}_${name}_${timestamp}.png`;
    const path = `screenshots/${filename}`;
    
    await this.page.screenshot({
      path,
      fullPage: options?.fullPage || false,
      clip: options?.clip
    });
    
    this.logger.info(`Mobile screenshot taken: ${path}`);
    return path;
  }

  /**
   * Get current device
   */
  getCurrentDevice(): MobileDevice | null {
    return this.currentDevice;
  }

  /**
   * Test touch interactions
   */
  async testTouchInteractions(selector: string): Promise<{
    tap: boolean;
    doubleTap: boolean;
    longPress: boolean;
    swipe: boolean;
  }> {
    const results = {
      tap: false,
      doubleTap: false,
      longPress: false,
      swipe: false
    };
    
    try {
      await this.tap(selector);
      results.tap = true;
    } catch (error) {
      this.logger.warn(`Tap test failed: ${error}`);
    }
    
    try {
      await this.doubleTap(selector);
      results.doubleTap = true;
    } catch (error) {
      this.logger.warn(`Double tap test failed: ${error}`);
    }
    
    try {
      await this.page.locator(selector).press('Enter', { delay: 1000 });
      results.longPress = true;
    } catch (error) {
      this.logger.warn(`Long press test failed: ${error}`);
    }
    
    try {
      const element = this.page.locator(selector);
      const box = await element.boundingBox();
      if (box) {
        await this.swipeByCoordinates(
          box.x + box.width / 2,
          box.y + box.height / 2,
          box.x + box.width / 2 + 100,
          box.y + box.height / 2
        );
        results.swipe = true;
      }
    } catch (error) {
      this.logger.warn(`Swipe test failed: ${error}`);
    }
    
    return results;
  }
}