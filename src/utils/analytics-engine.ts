import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

/**
 * Test result analytics and reporting engine
 */
export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  startTime: string;
  endTime: string;
  browser: string;
  project: string;
  suite: string;
  tags: string[];
  error?: string;
  screenshot?: string;
  video?: string;
  performance?: PerformanceMetrics;
  accessibility?: AccessibilityMetrics;
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface AccessibilityMetrics {
  violations: number;
  warnings: number;
  passes: number;
  score: number;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
}

export interface TestRun {
  id: string;
  timestamp: string;
  environment: string;
  branch: string;
  commit: string;
  suites: TestSuite[];
  summary: TestSummary;
}

export interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
  averageTestDuration: number;
  flakiness: number;
  performanceScore: number;
  accessibilityScore: number;
}

export interface TrendData {
  date: string;
  passRate: number;
  totalTests: number;
  averageDuration: number;
  performanceScore: number;
  accessibilityScore: number;
}

export class AnalyticsEngine {
  private logger: Logger;
  private resultsDir: string;
  private dashboardDir: string;

  constructor() {
    this.logger = new Logger();
    this.resultsDir = 'analytics/results';
    this.dashboardDir = 'analytics/dashboard';
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    const dirs = [this.resultsDir, this.dashboardDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Parse Playwright test results
   */
  async parsePlaywrightResults(resultsPath: string): Promise<TestRun> {
    try {
      const resultsContent = fs.readFileSync(resultsPath, 'utf-8');
      const playwrightResults = JSON.parse(resultsContent);
      
      const testRun: TestRun = {
        id: this.generateRunId(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        branch: process.env.GITHUB_REF || 'main',
        commit: process.env.GITHUB_SHA || 'unknown',
        suites: [],
        summary: {
          totalTests: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          passRate: 0,
          averageTestDuration: 0,
          flakiness: 0,
          performanceScore: 0,
          accessibilityScore: 0
        }
      };

      // Process suites
      if (playwrightResults.suites) {
        testRun.suites = await this.processSuites(playwrightResults.suites);
      }

      // Calculate summary
      testRun.summary = this.calculateSummary(testRun.suites);

      return testRun;
    } catch (error) {
      this.logger.error(`Failed to parse Playwright results: ${error}`);
      throw error;
    }
  }

  private async processSuites(suites: any[]): Promise<TestSuite[]> {
    const processedSuites: TestSuite[] = [];

    for (const suite of suites) {
      const testSuite: TestSuite = {
        name: suite.title || 'Unknown Suite',
        tests: [],
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        passRate: 0
      };

      if (suite.specs) {
        for (const spec of suite.specs) {
          if (spec.tests) {
            for (const test of spec.tests) {
              const testResult = await this.processTest(test, suite.title);
              testSuite.tests.push(testResult);
              testSuite.totalTests++;
              testSuite.duration += testResult.duration;
              
              switch (testResult.status) {
                case 'passed':
                  testSuite.passed++;
                  break;
                case 'failed':
                  testSuite.failed++;
                  break;
                case 'skipped':
                  testSuite.skipped++;
                  break;
              }
            }
          }
        }
      }

      testSuite.passRate = testSuite.totalTests > 0 ? 
        (testSuite.passed / testSuite.totalTests) * 100 : 0;

      processedSuites.push(testSuite);
    }

    return processedSuites;
  }

  private async processTest(test: any, suiteName: string): Promise<TestResult> {
    const testResult: TestResult = {
      id: this.generateTestId(test.title, suiteName),
      name: test.title || 'Unknown Test',
      status: 'skipped',
      duration: 0,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      browser: 'unknown',
      project: 'unknown',
      suite: suiteName,
      tags: []
    };

    if (test.results && test.results.length > 0) {
      const result = test.results[0];
      testResult.status = result.status || 'skipped';
      testResult.duration = result.duration || 0;
      testResult.startTime = result.startTime || new Date().toISOString();
      testResult.endTime = this.calculateEndTime(testResult.startTime, testResult.duration);
      
      if (result.error) {
        testResult.error = result.error.message || 'Unknown error';
      }

      // Extract attachments
      if (result.attachments) {
        for (const attachment of result.attachments) {
          if (attachment.contentType === 'image/png') {
            testResult.screenshot = attachment.path;
          } else if (attachment.contentType === 'video/webm') {
            testResult.video = attachment.path;
          }
        }
      }
    }

    return testResult;
  }

  private calculateEndTime(startTime: string, duration: number): string {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration);
    return end.toISOString();
  }

  private calculateSummary(suites: TestSuite[]): TestSummary {
    const summary: TestSummary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      passRate: 0,
      averageTestDuration: 0,
      flakiness: 0,
      performanceScore: 0,
      accessibilityScore: 0
    };

    for (const suite of suites) {
      summary.totalTests += suite.totalTests;
      summary.passed += suite.passed;
      summary.failed += suite.failed;
      summary.skipped += suite.skipped;
      summary.duration += suite.duration;
    }

    summary.passRate = summary.totalTests > 0 ? 
      (summary.passed / summary.totalTests) * 100 : 0;
    summary.averageTestDuration = summary.totalTests > 0 ? 
      summary.duration / summary.totalTests : 0;

    return summary;
  }

  /**
   * Store test results for analytics
   */
  async storeResults(testRun: TestRun): Promise<void> {
    const filePath = path.join(this.resultsDir, `${testRun.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(testRun, null, 2));
    this.logger.info(`Test results stored: ${filePath}`);
  }

  /**
   * Get historical trend data
   */
  async getTrendData(days: number = 30): Promise<TrendData[]> {
    const trendData: TrendData[] = [];
    const files = fs.readdirSync(this.resultsDir);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(this.resultsDir, file), 'utf-8');
          const testRun: TestRun = JSON.parse(content);
          
          const runDate = new Date(testRun.timestamp);
          if (runDate >= cutoffDate) {
            trendData.push({
              date: testRun.timestamp,
              passRate: testRun.summary.passRate,
              totalTests: testRun.summary.totalTests,
              averageDuration: testRun.summary.averageTestDuration,
              performanceScore: testRun.summary.performanceScore,
              accessibilityScore: testRun.summary.accessibilityScore
            });
          }
        } catch (error) {
          this.logger.warn(`Failed to parse results file: ${file}`);
        }
      }
    }

    return trendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Generate test flakiness report
   */
  async generateFlakinessReport(): Promise<any> {
    const files = fs.readdirSync(this.resultsDir);
    const testHistory: { [key: string]: TestResult[] } = {};

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(this.resultsDir, file), 'utf-8');
          const testRun: TestRun = JSON.parse(content);
          
          for (const suite of testRun.suites) {
            for (const test of suite.tests) {
              if (!testHistory[test.id]) {
                testHistory[test.id] = [];
              }
              testHistory[test.id].push(test);
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to parse results file: ${file}`);
        }
      }
    }

    const flakyTests = [];
    for (const [testId, results] of Object.entries(testHistory)) {
      if (results.length > 1) {
        const passed = results.filter(r => r.status === 'passed').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const total = results.length;
        
        if (passed > 0 && failed > 0) {
          const flakinessRate = (failed / total) * 100;
          flakyTests.push({
            id: testId,
            name: results[0].name,
            suite: results[0].suite,
            totalRuns: total,
            passed,
            failed,
            flakinessRate
          });
        }
      }
    }

    return flakyTests.sort((a, b) => b.flakinessRate - a.flakinessRate);
  }

  /**
   * Generate performance analysis
   */
  async generatePerformanceAnalysis(): Promise<any> {
    const files = fs.readdirSync(this.resultsDir);
    const performanceData: PerformanceMetrics[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(this.resultsDir, file), 'utf-8');
          const testRun: TestRun = JSON.parse(content);
          
          for (const suite of testRun.suites) {
            for (const test of suite.tests) {
              if (test.performance) {
                performanceData.push(test.performance);
              }
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to parse results file: ${file}`);
        }
      }
    }

    if (performanceData.length === 0) {
      return {
        averageLoadTime: 0,
        averageFCP: 0,
        averageLCP: 0,
        averageCLS: 0,
        averageTTI: 0,
        slowestTests: []
      };
    }

    const analysis = {
      averageLoadTime: performanceData.reduce((sum, p) => sum + p.loadTime, 0) / performanceData.length,
      averageFCP: performanceData.reduce((sum, p) => sum + p.firstContentfulPaint, 0) / performanceData.length,
      averageLCP: performanceData.reduce((sum, p) => sum + p.largestContentfulPaint, 0) / performanceData.length,
      averageCLS: performanceData.reduce((sum, p) => sum + p.cumulativeLayoutShift, 0) / performanceData.length,
      averageTTI: performanceData.reduce((sum, p) => sum + p.timeToInteractive, 0) / performanceData.length,
      slowestTests: performanceData
        .sort((a, b) => b.loadTime - a.loadTime)
        .slice(0, 10)
    };

    return analysis;
  }

  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTestId(testName: string, suiteName: string): string {
    return `${suiteName}_${testName}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateAnalyticsReport(): Promise<any> {
    const trendData = await this.getTrendData();
    const flakinessReport = await this.generateFlakinessReport();
    const performanceAnalysis = await this.generatePerformanceAnalysis();

    return {
      generated: new Date().toISOString(),
      trends: trendData,
      flakiness: flakinessReport,
      performance: performanceAnalysis,
      summary: {
        totalRuns: trendData.length,
        averagePassRate: trendData.reduce((sum, d) => sum + d.passRate, 0) / trendData.length,
        trendDirection: this.calculateTrendDirection(trendData),
        mostFlakyTests: flakinessReport.slice(0, 5),
        performanceIssues: performanceAnalysis.slowestTests?.slice(0, 5) || []
      }
    };
  }

  private calculateTrendDirection(trendData: TrendData[]): string {
    if (trendData.length < 2) return 'stable';
    
    const recent = trendData.slice(-5);
    const earlier = trendData.slice(-10, -5);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, d) => sum + d.passRate, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d.passRate, 0) / earlier.length;
    
    const difference = recentAvg - earlierAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }
}