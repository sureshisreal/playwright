import { test } from '../../src/fixtures/test-fixtures';
import { TestHelpers } from '../../src/utils/test-helpers';
import { CommonFlows } from '../../src/utils/common-flows';

test.describe('Simplified Accessibility Tests', () => {
  
  test('homepage accessibility', async ({ page, accessibilityHelper, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test homepage accessibility compliance',
      tags: ['accessibility', 'a11y', 'wcag'],
      severity: 'critical'
    })(allureHelper);

    await page.goto('https://example.com');
    
    const results = await CommonFlows.runA11yScan(accessibilityHelper);
    
    if (results.violations.length > 0) {
      throw new Error(`Found ${results.violations.length} accessibility violations`);
    }

    allureHelper.addParameter('Violations', results.violations.length.toString());
    allureHelper.addParameter('Passes', results.passes.toString());
  });

  test('keyboard navigation', async ({ page, accessibilityHelper, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test keyboard navigation',
      tags: ['accessibility', 'keyboard'],
      severity: 'normal'
    })(allureHelper);

    await page.goto('https://example.com');
    
    const keyboardResults = await accessibilityHelper.testKeyboardNavigation();
    
    if (keyboardResults.focusableElements.length === 0) {
      throw new Error('No focusable elements found');
    }

    allureHelper.addParameter('Focusable Elements', keyboardResults.focusableElements.length.toString());
  });
});