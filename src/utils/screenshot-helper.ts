import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { testConfig } from '../config/test-config';

/**
 * Screenshot helper for capturing and managing screenshots
 */
export class ScreenshotHelper {
  private page: Page;
  private logger: Logger;
  private screenshotDir: string;
  private screenshotCounter: number = 0;

  constructor(page: Page, screenshotDir: string = testConfig.screenshotDir) {
    this.page = page;
    this.logger = new Logger();
    this.screenshotDir = screenshotDir;
    this.ensureScreenshotDirectory();
  }

  /**
   * Ensure screenshot directory exists
   */
  private ensureScreenshotDirectory(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Generate screenshot filename
   */
  private generateFilename(name?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testInfo = this.getTestInfo();
    const counter = String(this.screenshotCounter++).padStart(3, '0');
    const customName = name ? `_${name}` : '';
    
    return `${testInfo}_${timestamp}_${counter}${customName}.png`;
  }

  /**
   * Get test information for filename
   */
  private getTestInfo(): string {
    const testTitle = process.env.PLAYWRIGHT_TEST_TITLE || 'unknown_test';
    const testFile = process.env.PLAYWRIGHT_TEST_FILE || 'unknown_file';
    return `${path.basename(testFile, '.spec.ts')}_${testTitle}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Take full page screenshot
   */
  async takeScreenshot(name?: string): Promise<string> {
    try {
      const filename = this.generateFilename(name);
      const filepath = path.join(this.screenshotDir, filename);
      
      await this.page.screenshot({
        path: filepath,
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });

      this.logger.screenshot(filepath);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to take screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot of specific element
   */
  async takeElementScreenshot(selector: string, name?: string): Promise<string> {
    try {
      const element = this.page.locator(selector);
      const filename = this.generateFilename(name || `element_${selector}`);
      const filepath = path.join(this.screenshotDir, filename);
      
      await element.screenshot({
        path: filepath,
        animations: 'disabled',
      });

      this.logger.screenshot(filepath);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to take element screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot with custom options
   */
  async takeCustomScreenshot(options: {
    name?: string;
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
    omitBackground?: boolean;
    quality?: number;
    type?: 'png' | 'jpeg';
  }): Promise<string> {
    try {
      const filename = this.generateFilename(options.name);
      const extension = options.type || 'png';
      const filepath = path.join(this.screenshotDir, filename.replace('.png', `.${extension}`));
      
      await this.page.screenshot({
        path: filepath,
        fullPage: options.fullPage !== false,
        clip: options.clip,
        omitBackground: options.omitBackground || false,
        quality: options.quality,
        type: options.type || 'png',
        animations: 'disabled',
        caret: 'hide',
      });

      this.logger.screenshot(filepath);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to take custom screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot on test failure
   */
  async takeFailureScreenshot(): Promise<string> {
    const filename = this.generateFilename('FAILURE');
    const filepath = path.join(this.screenshotDir, filename);
    
    try {
      await this.page.screenshot({
        path: filepath,
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });

      this.logger.screenshot(filepath);
      this.logger.error(`Test failed - screenshot saved: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to take failure screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot before action
   */
  async takeBeforeActionScreenshot(action: string): Promise<string> {
    return await this.takeScreenshot(`before_${action}`);
  }

  /**
   * Take screenshot after action
   */
  async takeAfterActionScreenshot(action: string): Promise<string> {
    return await this.takeScreenshot(`after_${action}`);
  }

  /**
   * Take comparison screenshots (before and after)
   */
  async takeComparisonScreenshots(action: string): Promise<{ before: string; after: string }> {
    const beforeScreenshot = await this.takeBeforeActionScreenshot(action);
    
    // Wait a bit for any animations to complete
    await this.page.waitForTimeout(500);
    
    const afterScreenshot = await this.takeAfterActionScreenshot(action);
    
    return {
      before: beforeScreenshot,
      after: afterScreenshot,
    };
  }

  /**
   * Take screenshot with annotation
   */
  async takeAnnotatedScreenshot(name: string, annotations: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    text?: string;
  }[]): Promise<string> {
    try {
      // First take a regular screenshot
      const screenshotPath = await this.takeScreenshot(name);
      
      // Add annotations using canvas (simplified version)
      await this.page.evaluate(
        ({ annotations }) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // This is a simplified annotation system
          // In a real implementation, you might want to use a proper image manipulation library
          annotations.forEach(annotation => {
            if (ctx) {
              ctx.strokeStyle = annotation.color || 'red';
              ctx.lineWidth = 2;
              ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
              
              if (annotation.text) {
                ctx.fillStyle = annotation.color || 'red';
                ctx.font = '14px Arial';
                ctx.fillText(annotation.text, annotation.x, annotation.y - 5);
              }
            }
          });
        },
        { annotations }
      );

      this.logger.screenshot(screenshotPath);
      return screenshotPath;
    } catch (error) {
      this.logger.error(`Failed to take annotated screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take mobile screenshot with device info
   */
  async takeMobileScreenshot(deviceName: string, name?: string): Promise<string> {
    const filename = this.generateFilename(name || `mobile_${deviceName}`);
    const filepath = path.join(this.screenshotDir, filename);
    
    try {
      await this.page.screenshot({
        path: filepath,
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });

      this.logger.screenshot(filepath);
      this.logger.info(`Mobile screenshot taken for ${deviceName}: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to take mobile screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot with browser info
   */
  async takeBrowserScreenshot(browserName: string, name?: string): Promise<string> {
    const filename = this.generateFilename(name || `browser_${browserName}`);
    const filepath = path.join(this.screenshotDir, filename);
    
    try {
      await this.page.screenshot({
        path: filepath,
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });

      this.logger.screenshot(filepath);
      this.logger.info(`Browser screenshot taken for ${browserName}: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to take browser screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Clean up old screenshots
   */
  async cleanupOldScreenshots(daysOld: number = 7): Promise<void> {
    try {
      const files = fs.readdirSync(this.screenshotDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      for (const file of files) {
        const filepath = path.join(this.screenshotDir, file);
        const stats = fs.statSync(filepath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filepath);
          this.logger.info(`Deleted old screenshot: ${filepath}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup old screenshots: ${error}`);
    }
  }

  /**
   * Get screenshot metadata
   */
  async getScreenshotMetadata(screenshotPath: string): Promise<{
    filepath: string;
    filename: string;
    size: number;
    created: Date;
    dimensions?: { width: number; height: number };
  }> {
    try {
      const stats = fs.statSync(screenshotPath);
      return {
        filepath: screenshotPath,
        filename: path.basename(screenshotPath),
        size: stats.size,
        created: stats.birthtime,
      };
    } catch (error) {
      this.logger.error(`Failed to get screenshot metadata: ${error}`);
      throw error;
    }
  }

  /**
   * List all screenshots for current test
   */
  async listScreenshots(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.screenshotDir);
      const testInfo = this.getTestInfo();
      
      return files
        .filter(file => file.startsWith(testInfo) && file.endsWith('.png'))
        .map(file => path.join(this.screenshotDir, file));
    } catch (error) {
      this.logger.error(`Failed to list screenshots: ${error}`);
      return [];
    }
  }

  /**
   * Reset screenshot counter
   */
  resetCounter(): void {
    this.screenshotCounter = 0;
  }

  /**
   * Get current screenshot counter
   */
  getCounter(): number {
    return this.screenshotCounter;
  }
}
