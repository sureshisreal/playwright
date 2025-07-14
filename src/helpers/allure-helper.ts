import { allure } from 'allure-playwright';
import { Logger } from '../utils/logger';
import { testConfig } from '../config/test-config';
import * as fs from 'fs';

/**
 * Allure helper for enhanced reporting with attachments
 */
export class AllureHelper {
  private logger: Logger;
  private currentTest: string = '';

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Start test with Allure annotations
   */
  async startTest(testName: string): Promise<void> {
    this.currentTest = testName;
    allure.epic('Test Automation Framework');
    allure.feature('Automated Testing');
    allure.story(testName);
    
    this.logger.info(`Started Allure test: ${testName}`);
  }

  /**
   * End test with result
   */
  async endTest(passed: boolean): Promise<void> {
    if (passed) {
      allure.status('passed');
    } else {
      allure.status('failed');
    }
    
    this.logger.info(`Ended Allure test: ${this.currentTest} - ${passed ? 'PASSED' : 'FAILED'}`);
  }

  /**
   * Add test description
   */
  addDescription(description: string): void {
    allure.description(description);
  }

  /**
   * Add test tags
   */
  addTags(tags: string[]): void {
    tags.forEach(tag => allure.tag(tag));
  }

  /**
   * Add test severity
   */
  addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    allure.severity(severity);
  }

  /**
   * Add test owner
   */
  addOwner(owner: string): void {
    allure.owner(owner);
  }

  /**
   * Add test issue link
   */
  addIssue(issueKey: string, issueUrl?: string): void {
    allure.issue(issueKey, issueUrl);
  }

  /**
   * Add test case link
   */
  addTestCase(testCaseKey: string, testCaseUrl?: string): void {
    allure.tms(testCaseKey, testCaseUrl);
  }

  /**
   * Add test step
   */
  async addStep(stepName: string, stepFunction: () => Promise<void>): Promise<void> {
    await allure.step(stepName, stepFunction);
  }

  /**
   * Add environment information
   */
  async addEnvironmentInfo(): Promise<void> {
    try {
      const environment = {
        'Test Environment': testConfig.environment,
        'Base URL': testConfig.baseUrl,
        'API Base URL': testConfig.apiBaseUrl,
        'Browser': 'Chromium', // This could be dynamic
        'OS': process.platform,
        'Node Version': process.version,
        'Timestamp': new Date().toISOString(),
      };

      // Add environment info to Allure
      Object.entries(environment).forEach(([key, value]) => {
        allure.parameter(key, value);
      });

      this.logger.info('Environment information added to Allure');
    } catch (error) {
      this.logger.error(`Failed to add environment info: ${error}`);
    }
  }

  /**
   * Add test parameters
   */
  addParameter(name: string, value: string): void {
    allure.parameter(name, value);
  }

  /**
   * Add test attachment
   */
  async addAttachment(name: string, content: string | Buffer, type: string = 'text/plain'): Promise<void> {
    try {
      allure.attachment(name, content, type);
      this.logger.info(`Attachment added: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to add attachment: ${error}`);
    }
  }

  /**
   * Add screenshot attachment
   */
  async addScreenshotAttachment(screenshotPath: string, name: string = 'Screenshot'): Promise<void> {
    try {
      if (fs.existsSync(screenshotPath)) {
        const screenshot = fs.readFileSync(screenshotPath);
        allure.attachment(name, screenshot, 'image/png');
        this.logger.info(`Screenshot attachment added: ${name}`);
      } else {
        this.logger.warn(`Screenshot file not found: ${screenshotPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to add screenshot attachment: ${error}`);
    }
  }

  /**
   * Add video attachment
   */
  async addVideoAttachment(videoPath: string, name: string = 'Video Recording'): Promise<void> {
    try {
      if (fs.existsSync(videoPath)) {
        const video = fs.readFileSync(videoPath);
        allure.attachment(name, video, 'video/webm');
        this.logger.info(`Video attachment added: ${name}`);
      } else {
        this.logger.warn(`Video file not found: ${videoPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to add video attachment: ${error}`);
    }
  }

  /**
   * Add log attachment
   */
  async addLogAttachment(logPath: string, name: string = 'Test Log'): Promise<void> {
    try {
      if (fs.existsSync(logPath)) {
        const log = fs.readFileSync(logPath, 'utf-8');
        allure.attachment(name, log, 'text/plain');
        this.logger.info(`Log attachment added: ${name}`);
      } else {
        this.logger.warn(`Log file not found: ${logPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to add log attachment: ${error}`);
    }
  }

  /**
   * Add JSON attachment
   */
  async addJsonAttachment(data: any, name: string = 'Data'): Promise<void> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      allure.attachment(name, jsonContent, 'application/json');
      this.logger.info(`JSON attachment added: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to add JSON attachment: ${error}`);
    }
  }

  /**
   * Add HTML attachment
   */
  async addHtmlAttachment(html: string, name: string = 'HTML Content'): Promise<void> {
    try {
      allure.attachment(name, html, 'text/html');
      this.logger.info(`HTML attachment added: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to add HTML attachment: ${error}`);
    }
  }

  /**
   * Add API response attachment
   */
  async addApiResponseAttachment(response: any, name: string = 'API Response'): Promise<void> {
    try {
      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        url: response.url,
        duration: response.duration,
      };
      
      await this.addJsonAttachment(responseData, name);
    } catch (error) {
      this.logger.error(`Failed to add API response attachment: ${error}`);
    }
  }

  /**
   * Add accessibility report attachment
   */
  async addAccessibilityReportAttachment(results: any, name: string = 'Accessibility Report'): Promise<void> {
    try {
      const report = {
        summary: {
          violations: results.violations.length,
          passes: results.passes,
          incomplete: results.incomplete,
          inapplicable: results.inapplicable,
          url: results.url,
          timestamp: results.timestamp,
        },
        violations: results.violations.map((violation: any) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.length,
        })),
      };
      
      await this.addJsonAttachment(report, name);
    } catch (error) {
      this.logger.error(`Failed to add accessibility report attachment: ${error}`);
    }
  }

  /**
   * Add performance report attachment
   */
  async addPerformanceReportAttachment(metrics: any, name: string = 'Performance Report'): Promise<void> {
    try {
      const report = {
        pageLoad: metrics.pageLoad,
        network: {
          totalRequests: metrics.network.totalRequests,
          totalSize: metrics.network.totalSize,
          averageResponseTime: metrics.network.averageResponseTime,
        },
        memory: metrics.memory,
        timing: metrics.timing,
        customMetrics: metrics.customMetrics,
      };
      
      await this.addJsonAttachment(report, name);
    } catch (error) {
      this.logger.error(`Failed to add performance report attachment: ${error}`);
    }
  }

  /**
   * Add test info to Allure
   */
  async addTestInfo(testInfo: any): Promise<void> {
    try {
      // Add basic test information
      allure.description(`Test: ${testInfo.title}`);
      allure.parameter('Test File', testInfo.file);
      allure.parameter('Test Line', testInfo.line?.toString() || 'N/A');
      allure.parameter('Test Column', testInfo.column?.toString() || 'N/A');
      allure.parameter('Project', testInfo.project?.name || 'Default');
      
      // Add test configuration
      const config = testConfig.getAll();
      allure.parameter('Environment', config.name);
      allure.parameter('Base URL', config.baseUrl);
      allure.parameter('Timeout', config.timeout.toString());
      allure.parameter('Retries', config.retries.toString());
      
      this.logger.info('Test info added to Allure');
    } catch (error) {
      this.logger.error(`Failed to add test info: ${error}`);
    }
  }

  /**
   * Attach all artifacts from test
   */
  async attachArtifacts(testInfo: any): Promise<void> {
    try {
      // Attach screenshots
      const screenshots = testInfo.attachments?.filter((att: any) => att.contentType === 'image/png') || [];
      for (const screenshot of screenshots) {
        if (screenshot.path) {
          await this.addScreenshotAttachment(screenshot.path, screenshot.name || 'Screenshot');
        }
      }

      // Attach videos
      const videos = testInfo.attachments?.filter((att: any) => att.contentType === 'video/webm') || [];
      for (const video of videos) {
        if (video.path) {
          await this.addVideoAttachment(video.path, video.name || 'Video Recording');
        }
      }

      // Attach traces
      const traces = testInfo.attachments?.filter((att: any) => att.contentType === 'application/zip') || [];
      for (const trace of traces) {
        if (trace.path) {
          const traceData = fs.readFileSync(trace.path);
          allure.attachment(trace.name || 'Trace', traceData, 'application/zip');
        }
      }

      this.logger.info('Artifacts attached to Allure');
    } catch (error) {
      this.logger.error(`Failed to attach artifacts: ${error}`);
    }
  }

  /**
   * Create test suite
   */
  createSuite(suiteName: string): void {
    allure.suite(suiteName);
  }

  /**
   * Create test sub-suite
   */
  createSubSuite(subSuiteName: string): void {
    allure.parentSuite(subSuiteName);
  }

  /**
   * Add test labels
   */
  addLabel(name: string, value: string): void {
    allure.label(name, value);
  }

  /**
   * Add test link
   */
  addLink(name: string, url: string, type: string = 'custom'): void {
    allure.link(url, name, type);
  }

  /**
   * Start test step
   */
  async startStep(stepName: string): Promise<void> {
    allure.step(stepName, async () => {
      // Step implementation will be in the callback
    });
  }

  /**
   * Add assertion step
   */
  async addAssertionStep(description: string, assertion: () => Promise<void>): Promise<void> {
    await allure.step(`Assert: ${description}`, assertion);
  }

  /**
   * Add action step
   */
  async addActionStep(description: string, action: () => Promise<void>): Promise<void> {
    await allure.step(`Action: ${description}`, action);
  }

  /**
   * Add verification step
   */
  async addVerificationStep(description: string, verification: () => Promise<void>): Promise<void> {
    await allure.step(`Verify: ${description}`, verification);
  }

  /**
   * Add setup step
   */
  async addSetupStep(description: string, setup: () => Promise<void>): Promise<void> {
    await allure.step(`Setup: ${description}`, setup);
  }

  /**
   * Add teardown step
   */
  async addTeardownStep(description: string, teardown: () => Promise<void>): Promise<void> {
    await allure.step(`Teardown: ${description}`, teardown);
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(testResults: any): Promise<void> {
    try {
      const report = {
        testResults,
        environment: testConfig.environment,
        timestamp: new Date().toISOString(),
        summary: {
          total: testResults.length,
          passed: testResults.filter((r: any) => r.status === 'passed').length,
          failed: testResults.filter((r: any) => r.status === 'failed').length,
          skipped: testResults.filter((r: any) => r.status === 'skipped').length,
        },
      };

      await this.addJsonAttachment(report, 'Custom Test Report');
      this.logger.info('Custom report generated');
    } catch (error) {
      this.logger.error(`Failed to generate custom report: ${error}`);
    }
  }
}
