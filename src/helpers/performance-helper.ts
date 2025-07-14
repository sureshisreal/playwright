import { Page } from '@playwright/test';
import { Logger } from '../utils/logger';
import { testConfig } from '../config/test-config';

/**
 * Performance helper for measuring and monitoring performance metrics
 */
export class PerformanceHelper {
  private page: Page;
  private logger: Logger;
  private performanceObserver: any;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger();
    this.metrics = this.initializeMetrics();
    this.thresholds = testConfig.performanceThresholds;
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      pageLoad: {
        domContentLoaded: 0,
        loadEvent: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
      },
      network: {
        requests: [],
        totalRequests: 0,
        totalSize: 0,
        averageResponseTime: 0,
      },
      resources: {
        images: [],
        scripts: [],
        stylesheets: [],
        fonts: [],
        other: [],
      },
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      },
      timing: {
        navigationStart: 0,
        responseStart: 0,
        responseEnd: 0,
        domInteractive: 0,
        domComplete: 0,
      },
      customMetrics: {},
    };
  }

  /**
   * Start performance monitoring
   */
  async startMonitoring(): Promise<void> {
    try {
      this.logger.step('Starting performance monitoring');
      
      // Clear previous metrics
      this.metrics = this.initializeMetrics();
      
      // Set up network monitoring
      this.page.on('request', (request) => {
        this.metrics.network.requests.push({
          url: request.url(),
          method: request.method(),
          size: 0,
          responseTime: 0,
          status: 0,
          startTime: Date.now(),
        });
      });

      this.page.on('response', (response) => {
        const request = this.metrics.network.requests.find(r => r.url === response.url());
        if (request) {
          request.status = response.status();
          request.responseTime = Date.now() - request.startTime;
          request.size = parseInt(response.headers()['content-length'] || '0');
        }
      });

      // Start performance observer
      await this.page.addInitScript(() => {
        if (typeof window !== 'undefined' && window.PerformanceObserver) {
          (window as any).performanceMetrics = {
            lcp: 0,
            fid: 0,
            cls: 0,
            fcp: 0,
            tti: 0,
          };

          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            (window as any).performanceMetrics.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              (window as any).performanceMetrics.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                (window as any).performanceMetrics.cls += entry.value;
              }
            });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          // First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.name === 'first-contentful-paint') {
                (window as any).performanceMetrics.fcp = entry.startTime;
              }
            });
          });
          fcpObserver.observe({ entryTypes: ['paint'] });
        }
      });

      this.logger.info('Performance monitoring started');
    } catch (error) {
      this.logger.error(`Failed to start performance monitoring: ${error}`);
      throw error;
    }
  }

  /**
   * Stop performance monitoring
   */
  async stopMonitoring(): Promise<void> {
    try {
      this.logger.step('Stopping performance monitoring');
      
      // Collect final metrics
      await this.collectMetrics();
      
      this.logger.info('Performance monitoring stopped');
    } catch (error) {
      this.logger.error(`Failed to stop performance monitoring: ${error}`);
      throw error;
    }
  }

  /**
   * Collect performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    try {
      this.logger.step('Collecting performance metrics');
      
      // Get navigation timing
      const navigationTiming = await this.page.evaluate(() => {
        const timing = performance.timing;
        return {
          navigationStart: timing.navigationStart,
          responseStart: timing.responseStart,
          responseEnd: timing.responseEnd,
          domInteractive: timing.domInteractive,
          domComplete: timing.domComplete,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadEvent: timing.loadEventEnd - timing.navigationStart,
        };
      });

      // Get Web Vitals
      const webVitals = await this.page.evaluate(() => {
        return (window as any).performanceMetrics || {};
      });

      // Get memory information
      const memoryInfo = await this.page.evaluate(() => {
        return (performance as any).memory || {};
      });

      // Get resource timing
      const resourceTiming = await this.page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.map((resource: any) => ({
          name: resource.name,
          type: resource.initiatorType,
          duration: resource.duration,
          size: resource.transferSize,
          startTime: resource.startTime,
          responseEnd: resource.responseEnd,
        }));
      });

      // Update metrics
      this.metrics.pageLoad = {
        domContentLoaded: navigationTiming.domContentLoaded,
        loadEvent: navigationTiming.loadEvent,
        firstContentfulPaint: webVitals.fcp || 0,
        largestContentfulPaint: webVitals.lcp || 0,
        firstInputDelay: webVitals.fid || 0,
        cumulativeLayoutShift: webVitals.cls || 0,
        timeToInteractive: webVitals.tti || 0,
      };

      this.metrics.timing = {
        navigationStart: navigationTiming.navigationStart,
        responseStart: navigationTiming.responseStart - navigationTiming.navigationStart,
        responseEnd: navigationTiming.responseEnd - navigationTiming.navigationStart,
        domInteractive: navigationTiming.domInteractive - navigationTiming.navigationStart,
        domComplete: navigationTiming.domComplete - navigationTiming.navigationStart,
      };

      this.metrics.memory = {
        usedJSHeapSize: memoryInfo.usedJSHeapSize || 0,
        totalJSHeapSize: memoryInfo.totalJSHeapSize || 0,
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit || 0,
      };

      // Process resource timing
      this.processResourceTiming(resourceTiming);

      // Calculate network metrics
      this.calculateNetworkMetrics();

      this.logger.info('Performance metrics collected');
      
      return this.metrics;
    } catch (error) {
      this.logger.error(`Failed to collect performance metrics: ${error}`);
      throw error;
    }
  }

  /**
   * Process resource timing data
   */
  private processResourceTiming(resources: any[]): void {
    resources.forEach(resource => {
      const resourceData = {
        name: resource.name,
        duration: resource.duration,
        size: resource.size,
        startTime: resource.startTime,
        responseEnd: resource.responseEnd,
      };

      switch (resource.type) {
        case 'img':
          this.metrics.resources.images.push(resourceData);
          break;
        case 'script':
          this.metrics.resources.scripts.push(resourceData);
          break;
        case 'css':
          this.metrics.resources.stylesheets.push(resourceData);
          break;
        case 'font':
          this.metrics.resources.fonts.push(resourceData);
          break;
        default:
          this.metrics.resources.other.push(resourceData);
      }
    });
  }

  /**
   * Calculate network metrics
   */
  private calculateNetworkMetrics(): void {
    this.metrics.network.totalRequests = this.metrics.network.requests.length;
    this.metrics.network.totalSize = this.metrics.network.requests.reduce((sum, req) => sum + req.size, 0);
    this.metrics.network.averageResponseTime = this.metrics.network.requests.reduce((sum, req) => sum + req.responseTime, 0) / this.metrics.network.totalRequests;
  }

  /**
   * Measure page load time
   */
  async measurePageLoad(url: string): Promise<number> {
    try {
      this.logger.step(`Measuring page load time for: ${url}`);
      
      const startTime = Date.now();
      await this.page.goto(url);
      await this.page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      this.logger.performance(`Page load time for ${url}`, loadTime);
      
      return loadTime;
    } catch (error) {
      this.logger.error(`Failed to measure page load time: ${error}`);
      throw error;
    }
  }

  /**
   * Measure action performance
   */
  async measureAction(action: () => Promise<void>, actionName: string): Promise<number> {
    try {
      this.logger.step(`Measuring performance for action: ${actionName}`);
      
      const startTime = Date.now();
      await action();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      this.logger.performance(`Action ${actionName}`, duration);
      
      return duration;
    } catch (error) {
      this.logger.error(`Failed to measure action performance: ${error}`);
      throw error;
    }
  }

  /**
   * Measure Core Web Vitals
   */
  async measureCoreWebVitals(): Promise<CoreWebVitals> {
    try {
      this.logger.step('Measuring Core Web Vitals');
      
      // Wait for metrics to be collected
      await this.page.waitForTimeout(3000);
      
      const vitals = await this.page.evaluate(() => {
        return (window as any).performanceMetrics || {};
      });

      const coreWebVitals: CoreWebVitals = {
        largestContentfulPaint: vitals.lcp || 0,
        firstInputDelay: vitals.fid || 0,
        cumulativeLayoutShift: vitals.cls || 0,
        firstContentfulPaint: vitals.fcp || 0,
        timeToInteractive: vitals.tti || 0,
      };

      this.logger.info(`Core Web Vitals measured: LCP=${coreWebVitals.largestContentfulPaint}ms, FID=${coreWebVitals.firstInputDelay}ms, CLS=${coreWebVitals.cumulativeLayoutShift}`);
      
      return coreWebVitals;
    } catch (error) {
      this.logger.error(`Failed to measure Core Web Vitals: ${error}`);
      throw error;
    }
  }

  /**
   * Measure network performance
   */
  async measureNetworkPerformance(): Promise<NetworkMetrics> {
    try {
      this.logger.step('Measuring network performance');
      
      const networkMetrics = await this.page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        
        return {
          totalRequests: resources.length,
          totalSize: resources.reduce((sum: number, resource: any) => sum + (resource.transferSize || 0), 0),
          averageResponseTime: resources.reduce((sum: number, resource: any) => sum + resource.duration, 0) / resources.length,
          slowestRequest: Math.max(...resources.map((resource: any) => resource.duration)),
          fastestRequest: Math.min(...resources.map((resource: any) => resource.duration)),
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnection: navigation.connectEnd - navigation.connectStart,
          tlsHandshake: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
          ttfb: navigation.responseStart - navigation.requestStart,
        };
      });

      this.logger.info(`Network performance measured: ${networkMetrics.totalRequests} requests, ${networkMetrics.totalSize} bytes`);
      
      return networkMetrics;
    } catch (error) {
      this.logger.error(`Failed to measure network performance: ${error}`);
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  async generateReport(): Promise<string> {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        url: this.page.url(),
        metrics: this.metrics,
        thresholds: this.thresholds,
        analysis: this.analyzePerformance(),
      };

      const reportJson = JSON.stringify(report, null, 2);
      this.logger.info('Performance report generated');
      
      return reportJson;
    } catch (error) {
      this.logger.error(`Failed to generate performance report: ${error}`);
      throw error;
    }
  }

  /**
   * Analyze performance metrics
   */
  private analyzePerformance(): PerformanceAnalysis {
    const analysis: PerformanceAnalysis = {
      score: 0,
      issues: [],
      recommendations: [],
    };

    // Analyze load time
    if (this.metrics.pageLoad.loadEvent > this.thresholds.loadTime) {
      analysis.issues.push(`Page load time (${this.metrics.pageLoad.loadEvent}ms) exceeds threshold (${this.thresholds.loadTime}ms)`);
      analysis.recommendations.push('Optimize images and minimize JavaScript');
    }

    // Analyze FCP
    if (this.metrics.pageLoad.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      analysis.issues.push(`First Contentful Paint (${this.metrics.pageLoad.firstContentfulPaint}ms) exceeds threshold (${this.thresholds.firstContentfulPaint}ms)`);
      analysis.recommendations.push('Optimize critical rendering path');
    }

    // Analyze LCP
    if (this.metrics.pageLoad.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
      analysis.issues.push(`Largest Contentful Paint (${this.metrics.pageLoad.largestContentfulPaint}ms) exceeds threshold (${this.thresholds.largestContentfulPaint}ms)`);
      analysis.recommendations.push('Optimize largest content element loading');
    }

    // Analyze CLS
    if (this.metrics.pageLoad.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      analysis.issues.push(`Cumulative Layout Shift (${this.metrics.pageLoad.cumulativeLayoutShift}) exceeds threshold (${this.thresholds.cumulativeLayoutShift})`);
      analysis.recommendations.push('Reserve space for dynamic content');
    }

    // Calculate score
    const totalIssues = analysis.issues.length;
    analysis.score = Math.max(0, 100 - (totalIssues * 25));

    return analysis;
  }

  /**
   * Assert performance thresholds
   */
  async assertPerformanceThresholds(): Promise<void> {
    const analysis = this.analyzePerformance();
    
    if (analysis.issues.length > 0) {
      throw new Error(`Performance thresholds exceeded:\n${analysis.issues.join('\n')}`);
    }
  }

  /**
   * Add custom metric
   */
  addCustomMetric(name: string, value: number): void {
    this.metrics.customMetrics[name] = value;
    this.logger.info(`Custom metric added: ${name} = ${value}`);
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.logger.info('Performance metrics reset');
  }
}

// Type definitions
export interface PerformanceMetrics {
  pageLoad: {
    domContentLoaded: number;
    loadEvent: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
  };
  network: {
    requests: Array<{
      url: string;
      method: string;
      size: number;
      responseTime: number;
      status: number;
      startTime: number;
    }>;
    totalRequests: number;
    totalSize: number;
    averageResponseTime: number;
  };
  resources: {
    images: ResourceData[];
    scripts: ResourceData[];
    stylesheets: ResourceData[];
    fonts: ResourceData[];
    other: ResourceData[];
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timing: {
    navigationStart: number;
    responseStart: number;
    responseEnd: number;
    domInteractive: number;
    domComplete: number;
  };
  customMetrics: Record<string, number>;
}

export interface ResourceData {
  name: string;
  duration: number;
  size: number;
  startTime: number;
  responseEnd: number;
}

export interface CoreWebVitals {
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
}

export interface NetworkMetrics {
  totalRequests: number;
  totalSize: number;
  averageResponseTime: number;
  slowestRequest: number;
  fastestRequest: number;
  dnsLookup: number;
  tcpConnection: number;
  tlsHandshake: number;
  ttfb: number;
}

export interface PerformanceThresholds {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export interface PerformanceAnalysis {
  score: number;
  issues: string[];
  recommendations: string[];
}
