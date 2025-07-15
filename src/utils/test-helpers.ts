/**
 * Simplified test helpers for common operations
 */
export class TestHelpers {
  /**
   * Quick test setup with common configuration
   */
  static setup(config: {
    description?: string;
    tags?: string[];
    severity?: string;
    owner?: string;
  }) {
    return async (allureHelper: any) => {
      if (config.description) await allureHelper.addDescription(config.description);
      if (config.tags) await allureHelper.addTags(config.tags);
      if (config.severity) await allureHelper.addSeverity(config.severity);
      if (config.owner) await allureHelper.addOwner(config.owner);
    };
  }

  /**
   * Quick page verification
   */
  static async verifyPage(page: any, expectations: {
    title?: string | RegExp;
    url?: string;
    elements?: string[];
  }) {
    if (expectations.title) {
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      if (typeof expectations.title === 'string') {
        if (!title.includes(expectations.title)) {
          throw new Error(`Expected title to contain "${expectations.title}" but got "${title}"`);
        }
      } else {
        if (!expectations.title.test(title)) {
          throw new Error(`Title "${title}" doesn't match pattern ${expectations.title}`);
        }
      }
    }

    if (expectations.url) {
      const currentUrl = page.url();
      if (!currentUrl.includes(expectations.url)) {
        throw new Error(`Expected URL to contain "${expectations.url}" but got "${currentUrl}"`);
      }
    }

    if (expectations.elements) {
      for (const selector of expectations.elements) {
        await page.waitForSelector(selector, { timeout: 5000 });
      }
    }
  }

  /**
   * Quick API test
   */
  static async testAPI(apiClient: any, config: {
    method: string;
    endpoint: string;
    data?: any;
    expectedStatus?: number;
    validate?: (response: any) => void;
  }) {
    const response = await apiClient[config.method.toLowerCase()](config.endpoint, config.data);
    
    if (config.expectedStatus) {
      if (response.status !== config.expectedStatus) {
        throw new Error(`Expected status ${config.expectedStatus} but got ${response.status}`);
      }
    }

    if (config.validate) {
      config.validate(response);
    }

    return response;
  }

  /**
   * Quick mobile test
   */
  static async testMobile(mobileHelper: any, page: any, config: {
    device: string;
    url: string;
    interactions?: Array<{ type: string; selector?: string; }>;
  }) {
    await mobileHelper.setDevice(config.device);
    await page.goto(config.url);

    if (config.interactions) {
      for (const interaction of config.interactions) {
        switch (interaction.type) {
          case 'tap':
            if (interaction.selector) {
              await mobileHelper.tap(interaction.selector);
            }
            break;
          case 'swipe':
            await mobileHelper.swipeByCoordinates(100, 400, 300, 400);
            break;
          case 'rotate':
            await mobileHelper.rotateDevice();
            break;
        }
      }
    }

    return await mobileHelper.takeScreenshot(`mobile-${config.device}`);
  }
}