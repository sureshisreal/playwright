import { Page } from '@playwright/test';
import { Logger } from '../utils/logger';
import { testConfig } from '../config/test-config';

/**
 * Accessibility helper for axe-core integration
 */
export class AccessibilityHelper {
  private page: Page;
  private logger: Logger;
  private axeConfig: any;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger();
    this.axeConfig = testConfig.axeConfig;
  }

  /**
   * Initialize axe-core
   */
  async initialize(): Promise<void> {
    try {
      // Inject axe-core script
      await this.page.addScriptTag({
        url: 'https://unpkg.com/axe-core@4.7.2/axe.min.js'
      });
      
      this.logger.info('Axe-core initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize axe-core: ${error}`);
      throw error;
    }
  }

  /**
   * Run accessibility scan on current page
   */
  async scanPage(options?: {
    include?: string[];
    exclude?: string[];
    tags?: string[];
    rules?: Record<string, any>;
  }): Promise<AccessibilityResults> {
    try {
      this.logger.step('Running accessibility scan');
      
      // Configure axe scan options
      const axeOptions = {
        tags: options?.tags || this.axeConfig.tags,
        rules: options?.rules || this.axeConfig.rules,
        include: options?.include,
        exclude: options?.exclude,
      };

      // Run axe scan
      const results = await this.page.evaluate((config) => {
        return (window as any).axe.run(document, config);
      }, axeOptions);

      const accessibilityResults: AccessibilityResults = {
        violations: results.violations.map((violation: any) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map((node: any) => ({
            html: node.html,
            target: node.target,
            failureSummary: node.failureSummary,
          })),
        })),
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
        timestamp: new Date().toISOString(),
        url: this.page.url(),
      };

      this.logger.info(`Accessibility scan completed: ${accessibilityResults.violations.length} violations found`);
      
      return accessibilityResults;
    } catch (error) {
      this.logger.error(`Accessibility scan failed: ${error}`);
      throw error;
    }
  }

  /**
   * Scan specific element
   */
  async scanElement(selector: string, options?: {
    tags?: string[];
    rules?: Record<string, any>;
  }): Promise<AccessibilityResults> {
    try {
      this.logger.step(`Running accessibility scan on element: ${selector}`);
      
      const axeOptions = {
        tags: options?.tags || this.axeConfig.tags,
        rules: options?.rules || this.axeConfig.rules,
        include: [selector],
      };

      const results = await this.page.evaluate((config) => {
        return (window as any).axe.run(document, config);
      }, axeOptions);

      const accessibilityResults: AccessibilityResults = {
        violations: results.violations.map((violation: any) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map((node: any) => ({
            html: node.html,
            target: node.target,
            failureSummary: node.failureSummary,
          })),
        })),
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
        timestamp: new Date().toISOString(),
        url: this.page.url(),
      };

      this.logger.info(`Element accessibility scan completed: ${accessibilityResults.violations.length} violations found`);
      
      return accessibilityResults;
    } catch (error) {
      this.logger.error(`Element accessibility scan failed: ${error}`);
      throw error;
    }
  }

  /**
   * Check for specific accessibility rule
   */
  async checkRule(ruleId: string, options?: {
    include?: string[];
    exclude?: string[];
  }): Promise<AccessibilityViolation[]> {
    try {
      this.logger.step(`Checking accessibility rule: ${ruleId}`);
      
      const axeOptions = {
        runOnly: [ruleId],
        include: options?.include,
        exclude: options?.exclude,
      };

      const results = await this.page.evaluate((config) => {
        return (window as any).axe.run(document, config);
      }, axeOptions);

      const violations = results.violations.map((violation: any) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node: any) => ({
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary,
        })),
      }));

      this.logger.info(`Rule check completed: ${violations.length} violations found for rule ${ruleId}`);
      
      return violations;
    } catch (error) {
      this.logger.error(`Rule check failed: ${error}`);
      throw error;
    }
  }

  /**
   * Check color contrast
   */
  async checkColorContrast(): Promise<AccessibilityViolation[]> {
    return await this.checkRule('color-contrast');
  }

  /**
   * Check keyboard navigation
   */
  async checkKeyboardNavigation(): Promise<AccessibilityViolation[]> {
    return await this.checkRule('keyboard-navigation');
  }

  /**
   * Check focus management
   */
  async checkFocusManagement(): Promise<AccessibilityViolation[]> {
    return await this.checkRule('focus-management');
  }

  /**
   * Check ARIA attributes
   */
  async checkAriaAttributes(): Promise<AccessibilityViolation[]> {
    const ariaRules = [
      'aria-allowed-attr',
      'aria-required-attr',
      'aria-valid-attr',
      'aria-valid-attr-value',
    ];

    const violations: AccessibilityViolation[] = [];
    
    for (const rule of ariaRules) {
      const ruleViolations = await this.checkRule(rule);
      violations.push(...ruleViolations);
    }

    return violations;
  }

  /**
   * Check heading structure
   */
  async checkHeadingStructure(): Promise<AccessibilityViolation[]> {
    return await this.checkRule('heading-order');
  }

  /**
   * Check form labels
   */
  async checkFormLabels(): Promise<AccessibilityViolation[]> {
    const formRules = [
      'label',
      'label-title-only',
      'form-field-multiple-labels',
    ];

    const violations: AccessibilityViolation[] = [];
    
    for (const rule of formRules) {
      const ruleViolations = await this.checkRule(rule);
      violations.push(...ruleViolations);
    }

    return violations;
  }

  /**
   * Check image alt text
   */
  async checkImageAltText(): Promise<AccessibilityViolation[]> {
    const imageRules = [
      'image-alt',
      'image-redundant-alt',
      'object-alt',
    ];

    const violations: AccessibilityViolation[] = [];
    
    for (const rule of imageRules) {
      const ruleViolations = await this.checkRule(rule);
      violations.push(...ruleViolations);
    }

    return violations;
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<KeyboardNavigationResults> {
    try {
      this.logger.step('Testing keyboard navigation');
      
      const results: KeyboardNavigationResults = {
        focusableElements: [],
        tabOrder: [],
        trapFocus: false,
        skipLinks: false,
      };

      // Get all focusable elements
      const focusableElements = await this.page.evaluate(() => {
        const elements = document.querySelectorAll(
          'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        );
        return Array.from(elements).map((el, index) => ({
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          className: el.className,
          index,
          tabIndex: (el as HTMLElement).tabIndex,
        }));
      });

      results.focusableElements = focusableElements;

      // Test tab order
      for (let i = 0; i < focusableElements.length; i++) {
        await this.page.keyboard.press('Tab');
        
        const focusedElement = await this.page.evaluate(() => {
          const focused = document.activeElement;
          return focused ? {
            tagName: focused.tagName.toLowerCase(),
            id: focused.id,
            className: focused.className,
          } : null;
        });

        if (focusedElement) {
          results.tabOrder.push(focusedElement);
        }
      }

      // Check for skip links
      const skipLinks = await this.page.evaluate(() => {
        const links = document.querySelectorAll('a[href^="#"]');
        return Array.from(links).some(link => 
          link.textContent?.toLowerCase().includes('skip') ||
          link.textContent?.toLowerCase().includes('jump')
        );
      });

      results.skipLinks = skipLinks;

      this.logger.info(`Keyboard navigation test completed: ${results.focusableElements.length} focusable elements found`);
      
      return results;
    } catch (error) {
      this.logger.error(`Keyboard navigation test failed: ${error}`);
      throw error;
    }
  }

  /**
   * Test screen reader compatibility
   */
  async testScreenReaderCompatibility(): Promise<ScreenReaderResults> {
    try {
      this.logger.step('Testing screen reader compatibility');
      
      const results: ScreenReaderResults = {
        landmarks: [],
        headings: [],
        links: [],
        forms: [],
        tables: [],
        images: [],
      };

      // Get landmarks
      results.landmarks = await this.page.evaluate(() => {
        const landmarks = document.querySelectorAll(
          'main, nav, header, footer, aside, section[aria-labelledby], section[aria-label], [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"]'
        );
        return Array.from(landmarks).map(el => ({
          tagName: el.tagName.toLowerCase(),
          role: el.getAttribute('role'),
          label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'),
        }));
      });

      // Get headings
      results.headings = await this.page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(headings).map(el => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim() || '',
        }));
      });

      // Get links
      results.links = await this.page.evaluate(() => {
        const links = document.querySelectorAll('a[href]');
        return Array.from(links).map(el => ({
          href: el.getAttribute('href'),
          text: el.textContent?.trim() || '',
          hasAriaLabel: !!el.getAttribute('aria-label'),
        }));
      });

      // Get forms
      results.forms = await this.page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).map(form => ({
          id: form.id,
          action: form.getAttribute('action'),
          method: form.getAttribute('method'),
          hasLabel: !!form.getAttribute('aria-label') || !!form.getAttribute('aria-labelledby'),
        }));
      });

      // Get tables
      results.tables = await this.page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        return Array.from(tables).map(table => ({
          hasCaption: !!table.querySelector('caption'),
          hasHeaders: !!table.querySelector('th'),
          hasScope: !!table.querySelector('th[scope]'),
        }));
      });

      // Get images
      results.images = await this.page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).map(img => ({
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
          hasAlt: img.hasAttribute('alt'),
          isDecorative: img.getAttribute('alt') === '',
        }));
      });

      this.logger.info('Screen reader compatibility test completed');
      
      return results;
    } catch (error) {
      this.logger.error(`Screen reader compatibility test failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate accessibility report
   */
  async generateReport(results: AccessibilityResults): Promise<string> {
    try {
      const report = {
        summary: {
          url: results.url,
          timestamp: results.timestamp,
          violations: results.violations.length,
          passes: results.passes,
          incomplete: results.incomplete,
          inapplicable: results.inapplicable,
        },
        violations: results.violations.map(violation => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          occurrences: violation.nodes.length,
          nodes: violation.nodes.map(node => ({
            target: node.target,
            html: node.html,
            summary: node.failureSummary,
          })),
        })),
      };

      const reportJson = JSON.stringify(report, null, 2);
      this.logger.info('Accessibility report generated');
      
      return reportJson;
    } catch (error) {
      this.logger.error(`Failed to generate accessibility report: ${error}`);
      throw error;
    }
  }

  /**
   * Assert no accessibility violations
   */
  async assertNoViolations(results: AccessibilityResults): Promise<void> {
    if (results.violations.length > 0) {
      const violationSummary = results.violations.map(v => `${v.id}: ${v.description}`).join('\n');
      throw new Error(`Accessibility violations found:\n${violationSummary}`);
    }
  }

  /**
   * Assert specific impact level violations
   */
  async assertNoViolationsWithImpact(results: AccessibilityResults, impact: 'minor' | 'moderate' | 'serious' | 'critical'): Promise<void> {
    const violationsWithImpact = results.violations.filter(v => v.impact === impact);
    
    if (violationsWithImpact.length > 0) {
      const violationSummary = violationsWithImpact.map(v => `${v.id}: ${v.description}`).join('\n');
      throw new Error(`Accessibility violations with ${impact} impact found:\n${violationSummary}`);
    }
  }
}

// Type definitions
export interface AccessibilityResults {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  timestamp: string;
  url: string;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface KeyboardNavigationResults {
  focusableElements: Array<{
    tagName: string;
    id: string;
    className: string;
    index: number;
    tabIndex: number;
  }>;
  tabOrder: Array<{
    tagName: string;
    id: string;
    className: string;
  }>;
  trapFocus: boolean;
  skipLinks: boolean;
}

export interface ScreenReaderResults {
  landmarks: Array<{
    tagName: string;
    role: string | null;
    label: string | null;
  }>;
  headings: Array<{
    level: number;
    text: string;
  }>;
  links: Array<{
    href: string | null;
    text: string;
    hasAriaLabel: boolean;
  }>;
  forms: Array<{
    id: string;
    action: string | null;
    method: string | null;
    hasLabel: boolean;
  }>;
  tables: Array<{
    hasCaption: boolean;
    hasHeaders: boolean;
    hasScope: boolean;
  }>;
  images: Array<{
    src: string | null;
    alt: string | null;
    hasAlt: boolean;
    isDecorative: boolean;
  }>;
}
