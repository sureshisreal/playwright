import { test, expect } from '../../src/fixtures/test-fixtures';
import { PerformanceHelper } from '../../src/helpers/performance-helper';
import { testConfig } from '../../src/config/test-config';

test.describe('Performance Tests', () => {
  let performanceHelper: PerformanceHelper;

  test.beforeEach(async ({ page, allureHelper }) => {
    performanceHelper = new PerformanceHelper(page);
    await performanceHelper.startMonitoring();
    
    await allureHelper.addStep('Initialize performance monitoring', async () => {
      // Performance monitoring is started
    });
  });

  test.afterEach(async ({ page }) => {
    await performanceHelper.stopMonitoring();
  });

  test('should meet page load performance thresholds', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test page load performance against defined thresholds');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['performance', 'load-time', 'thresholds']);
    allureHelper.addOwner('performance-team');

    let loadTime: number;
    let metrics: any;

    await allureHelper.addStep('Measure page load time', async () => {
      loadTime = await performanceHelper.measurePageLoad(testConfig.baseUrl);
    });

    await allureHelper.addStep('Collect performance metrics', async () => {
      metrics = await performanceHelper.collectMetrics();
    });

    await allureHelper.addStep('Take performance screenshot', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('performance_test');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Performance Test Page');
    });

    await allureHelper.addStep('Add performance report to results', async () => {
      const report = await performanceHelper.generateReport();
      await allureHelper.addPerformanceReportAttachment(metrics, 'Performance Report');
    });

    await allureHelper.addStep('Verify performance thresholds', async () => {
      await performanceHelper.assertPerformanceThresholds();
    });

    // Add performance metrics as parameters
    allureHelper.addParameter('Page Load Time', `${loadTime}ms`);
    allureHelper.addParameter('DOM Content Loaded', `${metrics.pageLoad.domContentLoaded}ms`);
    allureHelper.addParameter('First Contentful Paint', `${metrics.pageLoad.firstContentfulPaint}ms`);
    allureHelper.addParameter('Largest Contentful Paint', `${metrics.pageLoad.largestContentfulPaint}ms`);
    allureHelper.addParameter('Cumulative Layout Shift', `${metrics.pageLoad.cumulativeLayoutShift}`);

    // Assert specific thresholds
    expect(loadTime).toBeLessThan(testConfig.performanceThresholds.loadTime);
    expect(metrics.pageLoad.firstContentfulPaint).toBeLessThan(testConfig.performanceThresholds.firstContentfulPaint);
    expect(metrics.pageLoad.largestContentfulPaint).toBeLessThan(testConfig.performanceThresholds.largestContentfulPaint);
    expect(metrics.pageLoad.cumulativeLayoutShift).toBeLessThan(testConfig.performanceThresholds.cumulativeLayoutShift);

    logger.pass(`Page load performance test passed: ${loadTime}ms`);
  });

  test('should measure Core Web Vitals', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Measure Core Web Vitals metrics');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['performance', 'core-web-vitals', 'user-experience']);
    allureHelper.addOwner('performance-team');

    let coreWebVitals: any;

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto(testConfig.baseUrl);
      await page.waitForLoadState('networkidle');
    });

    await allureHelper.addStep('Measure Core Web Vitals', async () => {
      coreWebVitals = await performanceHelper.measureCoreWebVitals();
    });

    await allureHelper.addStep('Add Core Web Vitals to report', async () => {
      await allureHelper.addJsonAttachment(coreWebVitals, 'Core Web Vitals');
    });

    // Add metrics as parameters
    allureHelper.addParameter('LCP (Largest Contentful Paint)', `${coreWebVitals.largestContentfulPaint}ms`);
    allureHelper.addParameter('FID (First Input Delay)', `${coreWebVitals.firstInputDelay}ms`);
    allureHelper.addParameter('CLS (Cumulative Layout Shift)', `${coreWebVitals.cumulativeLayoutShift}`);
    allureHelper.addParameter('FCP (First Contentful Paint)', `${coreWebVitals.firstContentfulPaint}ms`);
    allureHelper.addParameter('TTI (Time to Interactive)', `${coreWebVitals.timeToInteractive}ms`);

    // Assert Core Web Vitals thresholds (Google's recommended values)
    expect(coreWebVitals.largestContentfulPaint).toBeLessThan(2500); // Good LCP < 2.5s
    expect(coreWebVitals.firstInputDelay).toBeLessThan(100); // Good FID < 100ms
    expect(coreWebVitals.cumulativeLayoutShift).toBeLessThan(0.1); // Good CLS < 0.1
    expect(coreWebVitals.firstContentfulPaint).toBeLessThan(1800); // Good FCP < 1.8s

    logger.pass('Core Web Vitals measurement completed');
  });

  test('should measure network performance', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Measure network performance metrics');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['performance', 'network', 'requests']);
    allureHelper.addOwner('performance-team');

    let networkMetrics: any;

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto(testConfig.baseUrl);
      await page.waitForLoadState('networkidle');
    });

    await allureHelper.addStep('Measure network performance', async () => {
      networkMetrics = await performanceHelper.measureNetworkPerformance();
    });

    await allureHelper.addStep('Add network metrics to report', async () => {
      await allureHelper.addJsonAttachment(networkMetrics, 'Network Performance');
    });

    // Add metrics as parameters
    allureHelper.addParameter('Total Requests', networkMetrics.totalRequests.toString());
    allureHelper.addParameter('Total Size', `${Math.round(networkMetrics.totalSize / 1024)}KB`);
    allureHelper.addParameter('Average Response Time', `${Math.round(networkMetrics.averageResponseTime)}ms`);
    allureHelper.addParameter('Slowest Request', `${Math.round(networkMetrics.slowestRequest)}ms`);
    allureHelper.addParameter('Fastest Request', `${Math.round(networkMetrics.fastestRequest)}ms`);
    allureHelper.addParameter('DNS Lookup', `${Math.round(networkMetrics.dnsLookup)}ms`);
    allureHelper.addParameter('TCP Connection', `${Math.round(networkMetrics.tcpConnection)}ms`);
    allureHelper.addParameter('TTFB', `${Math.round(networkMetrics.ttfb)}ms`);

    // Assert network performance thresholds
    expect(networkMetrics.averageResponseTime).toBeLessThan(3000); // Average response < 3s
    expect(networkMetrics.slowestRequest).toBeLessThan(10000); // Slowest request < 10s
    expect(networkMetrics.ttfb).toBeLessThan(1000); // TTFB < 1s
    expect(networkMetrics.totalSize).toBeLessThan(5 * 1024 * 1024); // Total size < 5MB

    logger.pass('Network performance measurement completed');
  });

  test('should measure action performance', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Measure performance of specific user actions');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['performance', 'actions', 'user-interaction']);
    allureHelper.addOwner('performance-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto(testConfig.baseUrl);
      await page.waitForLoadState('networkidle');
    });

    let searchActionTime: number;
    let clickActionTime: number;
    let navigationTime: number;

    await allureHelper.addStep('Measure search action performance', async () => {
      searchActionTime = await performanceHelper.measureAction(async () => {
        await page.fill('[data-testid="search-input"]', 'test search');
        await page.click('[data-testid="search-button"]');
        await page.waitForLoadState('networkidle');
      }, 'search');
    });

    await allureHelper.addStep('Measure click action performance', async () => {
      clickActionTime = await performanceHelper.measureAction(async () => {
        await page.click('[data-testid="logo"]');
        await page.waitForLoadState('networkidle');
      }, 'click');
    });

    await allureHelper.addStep('Measure navigation performance', async () => {
      navigationTime = await performanceHelper.measureAction(async () => {
        await page.goto(`${testConfig.baseUrl}/about`);
        await page.waitForLoadState('networkidle');
      }, 'navigation');
    });

    // Add action performance as parameters
    allureHelper.addParameter('Search Action Time', `${searchActionTime}ms`);
    allureHelper.addParameter('Click Action Time', `${clickActionTime}ms`);
    allureHelper.addParameter('Navigation Time', `${navigationTime}ms`);

    // Assert action performance thresholds
    expect(searchActionTime).toBeLessThan(5000); // Search action < 5s
    expect(clickActionTime).toBeLessThan(1000); // Click action < 1s
    expect(navigationTime).toBeLessThan(3000); // Navigation < 3s

    logger.pass('Action performance measurement completed');
  });

  test('should monitor memory usage', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Monitor memory usage during test execution');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['performance', 'memory', 'resources']);
    allureHelper.addOwner('performance-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto(testConfig.baseUrl);
      await page.waitForLoadState('networkidle');
    });

    let initialMetrics: any;
    let finalMetrics: any;

    await allureHelper.addStep('Collect initial metrics', async () => {
      initialMetrics = await performanceHelper.collectMetrics();
    });

    await allureHelper.addStep('Perform memory-intensive operations', async () => {
      // Navigate through multiple pages
      for (let i = 0; i < 5; i++) {
        await page.goto(`${testConfig.baseUrl}?page=${i}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    });

    await allureHelper.addStep('Collect final metrics', async () => {
      finalMetrics = await performanceHelper.collectMetrics();
    });

    await allureHelper.addStep('Add memory usage to report', async () => {
      const memoryReport = {
        initial: initialMetrics.memory,
        final: finalMetrics.memory,
        difference: {
          usedJSHeapSize: finalMetrics.memory.usedJSHeapSize - initialMetrics.memory.usedJSHeapSize,
          totalJSHeapSize: finalMetrics.memory.totalJSHeapSize - initialMetrics.memory.totalJSHeapSize,
        }
      };
      await allureHelper.addJsonAttachment(memoryReport, 'Memory Usage Report');
    });

    // Add memory metrics as parameters
    allureHelper.addParameter('Initial Used Heap', `${Math.round(initialMetrics.memory.usedJSHeapSize / 1024 / 1024)}MB`);
    allureHelper.addParameter('Final Used Heap', `${Math.round(finalMetrics.memory.usedJSHeapSize / 1024 / 1024)}MB`);
    allureHelper.addParameter('Memory Increase', `${Math.round((finalMetrics.memory.usedJSHeapSize - initialMetrics.memory.usedJSHeapSize) / 1024 / 1024)}MB`);
    allureHelper.addParameter('Heap Size Limit', `${Math.round(finalMetrics.memory.jsHeapSizeLimit / 1024 / 1024)}MB`);

    // Assert memory usage is within acceptable limits
    const memoryIncrease = finalMetrics.memory.usedJSHeapSize - initialMetrics.memory.usedJSHeapSize;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Memory increase < 50MB
    expect(finalMetrics.memory.usedJSHeapSize).toBeLessThan(finalMetrics.memory.jsHeapSizeLimit * 0.8); // Used heap < 80% of limit

    logger.pass('Memory usage monitoring completed');
  });

  test('should measure resource loading performance', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Measure resource loading performance');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['performance', 'resources', 'loading']);
    allureHelper.addOwner('performance-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto(testConfig.baseUrl);
      await page.waitForLoadState('networkidle');
    });

    let metrics: any;

    await allureHelper.addStep('Collect resource metrics', async () => {
      metrics = await performanceHelper.collectMetrics();
    });

    await allureHelper.addStep('Analyze resource performance', async () => {
      const resourceSummary = {
        images: {
          count: metrics.resources.images.length,
          totalSize: metrics.resources.images.reduce((sum: number, img: any) => sum + img.size, 0),
          averageLoadTime: metrics.resources.images.reduce((sum: number, img: any) => sum + img.duration, 0) / metrics.resources.images.length,
        },
        scripts: {
          count: metrics.resources.scripts.length,
          totalSize: metrics.resources.scripts.reduce((sum: number, script: any) => sum + script.size, 0),
          averageLoadTime: metrics.resources.scripts.reduce((sum: number, script: any) => sum + script.duration, 0) / metrics.resources.scripts.length,
        },
        stylesheets: {
          count: metrics.resources.stylesheets.length,
          totalSize: metrics.resources.stylesheets.reduce((sum: number, css: any) => sum + css.size, 0),
          averageLoadTime: metrics.resources.stylesheets.reduce((sum: number, css: any) => sum + css.duration, 0) / metrics.resources.stylesheets.length,
        },
        fonts: {
          count: metrics.resources.fonts.length,
          totalSize: metrics.resources.fonts.reduce((sum: number, font: any) => sum + font.size, 0),
          averageLoadTime: metrics.resources.fonts.reduce((sum: number, font: any) => sum + font.duration, 0) / metrics.resources.fonts.length,
        },
      };

      await allureHelper.addJsonAttachment(resourceSummary, 'Resource Performance Summary');
    });

    // Add resource metrics as parameters
    allureHelper.addParameter('Total Images', metrics.resources.images.length.toString());
    allureHelper.addParameter('Total Scripts', metrics.resources.scripts.length.toString());
    allureHelper.addParameter('Total Stylesheets', metrics.resources.stylesheets.length.toString());
    allureHelper.addParameter('Total Fonts', metrics.resources.fonts.length.toString());

    // Assert resource performance
    expect(metrics.resources.images.length).toBeLessThan(20); // < 20 images
    expect(metrics.resources.scripts.length).toBeLessThan(10); // < 10 scripts
    expect(metrics.resources.stylesheets.length).toBeLessThan(5); // < 5 stylesheets

    logger.pass('Resource loading performance measurement completed');
  });

  test('should test performance under load', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test performance under simulated load');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['performance', 'load-testing', 'stress']);
    allureHelper.addOwner('performance-team');

    const loadTestResults: any[] = [];

    await allureHelper.addStep('Run load test simulation', async () => {
      // Simulate multiple rapid operations
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        await page.goto(`${testConfig.baseUrl}?load=${i}`);
        await page.waitForLoadState('networkidle');
        
        const duration = Date.now() - startTime;
        loadTestResults.push({
          iteration: i + 1,
          duration,
          url: `${testConfig.baseUrl}?load=${i}`,
        });
      }
    });

    await allureHelper.addStep('Analyze load test results', async () => {
      const averageLoadTime = loadTestResults.reduce((sum, result) => sum + result.duration, 0) / loadTestResults.length;
      const maxLoadTime = Math.max(...loadTestResults.map(r => r.duration));
      const minLoadTime = Math.min(...loadTestResults.map(r => r.duration));

      const loadAnalysis = {
        totalIterations: loadTestResults.length,
        averageLoadTime,
        maxLoadTime,
        minLoadTime,
        results: loadTestResults,
      };

      await allureHelper.addJsonAttachment(loadAnalysis, 'Load Test Analysis');
    });

    // Calculate performance metrics
    const averageLoadTime = loadTestResults.reduce((sum, result) => sum + result.duration, 0) / loadTestResults.length;
    const maxLoadTime = Math.max(...loadTestResults.map(r => r.duration));

    allureHelper.addParameter('Average Load Time', `${Math.round(averageLoadTime)}ms`);
    allureHelper.addParameter('Max Load Time', `${Math.round(maxLoadTime)}ms`);
    allureHelper.addParameter('Load Test Iterations', loadTestResults.length.toString());

    // Assert load performance
    expect(averageLoadTime).toBeLessThan(5000); // Average load time < 5s
    expect(maxLoadTime).toBeLessThan(10000); // Max load time < 10s

    logger.pass('Load test completed successfully');
  });

  test('should add custom performance metrics', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test custom performance metrics functionality');
    allureHelper.addSeverity('minor');
    allureHelper.addTags(['performance', 'custom-metrics', 'monitoring']);
    allureHelper.addOwner('performance-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto(testConfig.baseUrl);
      await page.waitForLoadState('networkidle');
    });

    await allureHelper.addStep('Add custom metrics', async () => {
      // Add custom performance metrics
      performanceHelper.addCustomMetric('custom_page_load', 1250);
      performanceHelper.addCustomMetric('custom_api_response', 750);
      performanceHelper.addCustomMetric('custom_user_interaction', 300);
    });

    await allureHelper.addStep('Collect and verify custom metrics', async () => {
      const metrics = performanceHelper.getMetrics();
      
      expect(metrics.customMetrics['custom_page_load']).toBe(1250);
      expect(metrics.customMetrics['custom_api_response']).toBe(750);
      expect(metrics.customMetrics['custom_user_interaction']).toBe(300);

      await allureHelper.addJsonAttachment(metrics.customMetrics, 'Custom Performance Metrics');
    });

    allureHelper.addParameter('Custom Page Load', '1250ms');
    allureHelper.addParameter('Custom API Response', '750ms');
    allureHelper.addParameter('Custom User Interaction', '300ms');

    logger.pass('Custom performance metrics test completed');
  });

  test.afterEach(async ({ page, logger, screenshotHelper, allureHelper }, testInfo) => {
    // Generate performance report
    const metrics = performanceHelper.getMetrics();
    const report = await performanceHelper.generateReport();
    
    await allureHelper.addPerformanceReportAttachment(metrics, 'Final Performance Report');

    if (testInfo.status === 'failed') {
      const screenshotPath = await screenshotHelper.takeFailureScreenshot();
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Performance Test Failure');
    }

    logger.info(`Performance test ${testInfo.title} completed with status: ${testInfo.status}`);
  });
});
