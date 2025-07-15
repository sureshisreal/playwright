import { test } from '../../src/fixtures/test-fixtures';
import { TestHelpers } from '../../src/utils/test-helpers';
import { CommonFlows } from '../../src/utils/common-flows';

test.describe('Simplified Performance Tests', () => {
  
  test('page load performance', async ({ page, performanceHelper, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test page load performance',
      tags: ['performance', 'load-time'],
      severity: 'critical'
    })(allureHelper);

    const metrics = await CommonFlows.monitorPerformance(
      performanceHelper, 
      page, 
      'https://example.com'
    );

    // Simple assertions
    if (metrics.pageLoad.loadEvent > 3000) {
      throw new Error(`Page load too slow: ${metrics.pageLoad.loadEvent}ms`);
    }

    allureHelper.addParameter('Load Time', `${metrics.pageLoad.loadEvent}ms`);
    allureHelper.addParameter('FCP', `${metrics.pageLoad.firstContentfulPaint}ms`);
  });

  test('core web vitals', async ({ page, performanceHelper, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test Core Web Vitals',
      tags: ['performance', 'core-web-vitals'],
      severity: 'critical'
    })(allureHelper);

    await page.goto('https://example.com');
    const vitals = await performanceHelper.measureCoreWebVitals();

    // Simple thresholds
    const checks = [
      { metric: 'LCP', value: vitals.largestContentfulPaint, threshold: 2500 },
      { metric: 'FID', value: vitals.firstInputDelay, threshold: 100 },
      { metric: 'CLS', value: vitals.cumulativeLayoutShift, threshold: 0.1 }
    ];

    for (const check of checks) {
      if (check.value > check.threshold) {
        throw new Error(`${check.metric} too high: ${check.value} > ${check.threshold}`);
      }
      allureHelper.addParameter(check.metric, check.value.toString());
    }
  });
});