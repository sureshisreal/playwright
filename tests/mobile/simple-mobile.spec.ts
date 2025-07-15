import { test } from '../../src/fixtures/test-fixtures';
import { TestHelpers } from '../../src/utils/test-helpers';
import { CommonFlows } from '../../src/utils/common-flows';

test.describe('Simplified Mobile Tests', () => {
  
  test('mobile device interaction', async ({ page, mobileHelper, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test mobile device interactions',
      tags: ['mobile', 'touch'],
      severity: 'normal'
    })(allureHelper);

    await TestHelpers.testMobile(mobileHelper, page, {
      device: 'iPhone 13',
      url: 'https://example.com',
      interactions: [
        { type: 'tap', selector: 'a' },
        { type: 'rotate' }
      ]
    });
  });

  test('responsive design', async ({ page, mobileHelper, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test responsive design across devices',
      tags: ['mobile', 'responsive'],
      severity: 'normal'
    })(allureHelper);

    const devices = ['iPhone 13', 'iPad Air', 'Samsung Galaxy S21'];
    
    for (const device of devices) {
      await CommonFlows.setupMobile(mobileHelper, device);
      await page.goto('https://example.com');
      await mobileHelper.takeScreenshot(`responsive-${device}`);
    }
  });
});