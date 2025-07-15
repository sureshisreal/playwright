/**
 * Ultra-fast test creation utility
 */
export class QuickTest {
  /**
   * Create a UI test in one line
   */
  static ui(name: string, url: string, actions: string[]) {
    return `
import { test } from '../../src/fixtures/test-fixtures';
import { TestHelpers } from '../../src/utils/test-helpers';

test('${name}', async ({ page, allureHelper }) => {
  await TestHelpers.setup({ description: '${name}', tags: ['ui'] })(allureHelper);
  await page.goto('${url}');
  ${actions.map(action => `await page.${action};`).join('\n  ')}
});`;
  }

  /**
   * Create an API test in one line
   */
  static api(name: string, method: string, endpoint: string) {
    return `
import { test } from '../../src/fixtures/test-fixtures';
import { TestHelpers } from '../../src/utils/test-helpers';

test('${name}', async ({ apiClient, allureHelper }) => {
  await TestHelpers.setup({ description: '${name}', tags: ['api'] })(allureHelper);
  await TestHelpers.testAPI(apiClient, {
    method: '${method}',
    endpoint: '${endpoint}',
    expectedStatus: 200
  });
});`;
  }

  /**
   * Create a mobile test in one line
   */
  static mobile(name: string, device: string, url: string) {
    return `
import { test } from '../../src/fixtures/test-fixtures';
import { TestHelpers } from '../../src/utils/test-helpers';

test('${name}', async ({ page, mobileHelper, allureHelper }) => {
  await TestHelpers.setup({ description: '${name}', tags: ['mobile'] })(allureHelper);
  await TestHelpers.testMobile(mobileHelper, page, {
    device: '${device}',
    url: '${url}'
  });
});`;
  }
}