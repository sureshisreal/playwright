import { test } from '../../src/fixtures/test-fixtures';
import { TestBuilder, TestActions } from '../../src/utils/test-builder';
import { CommonFlows } from '../../src/utils/common-flows';
import { TestHelpers } from '../../src/utils/test-helpers';

test.describe('Simplified UI Tests', () => {
  
  test('homepage loads correctly', async ({ page, allureHelper, screenshotHelper }) => {
    await TestBuilder
      .create('Homepage Load Test')
      .describe('Verify homepage loads with all elements')
      .tag('ui', 'smoke')
      .step('Navigate to homepage', TestActions.navigate(page, 'https://example.com'))
      .step('Verify page elements', TestActions.verify(page, 'h1', 'Example Domain'))
      .step('Take screenshot', TestActions.screenshot(screenshotHelper, 'homepage'))
      .execute({ allureHelper });
  });

  test('user can search', async ({ page, allureHelper }) => {
    const setup = TestHelpers.setup({
      description: 'Test search functionality',
      tags: ['ui', 'search'],
      severity: 'normal'
    });
    
    await setup(allureHelper);
    
    await page.goto('https://example.com');
    await CommonFlows.search(page, 'test query');
    
    await TestHelpers.verifyPage(page, {
      elements: ['[data-test="search-results"]']
    });
  });

  test('login flow works', async ({ page, allureHelper, testData }) => {
    await TestHelpers.setup({
      description: 'Test user login',
      tags: ['ui', 'auth'],
      severity: 'critical'
    })(allureHelper);

    const user = testData.generateUserData();
    await CommonFlows.login(page, user.username, user.password);
    
    await TestHelpers.verifyPage(page, {
      elements: ['[data-test="dashboard"]']
    });
  });
});