/**
 * Test builder utility for rapid test creation
 */
export class TestBuilder {
  private testName: string = '';
  private description: string = '';
  private tags: string[] = [];
  private steps: Array<{ name: string; action: () => Promise<void> }> = [];

  static create(name: string): TestBuilder {
    const builder = new TestBuilder();
    builder.testName = name;
    return builder;
  }

  describe(description: string): TestBuilder {
    this.description = description;
    return this;
  }

  tag(...tags: string[]): TestBuilder {
    this.tags.push(...tags);
    return this;
  }

  step(name: string, action: () => Promise<void>): TestBuilder {
    this.steps.push({ name, action });
    return this;
  }

  async execute(context: any): Promise<void> {
    const { allureHelper } = context;
    
    if (this.description) {
      await allureHelper.addDescription(this.description);
    }
    
    if (this.tags.length > 0) {
      await allureHelper.addTags(this.tags);
    }

    for (const step of this.steps) {
      await allureHelper.addStep(step.name, step.action);
    }
  }
}

/**
 * Common test actions for reuse
 */
export class TestActions {
  static navigate(page: any, url: string) {
    return async () => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    };
  }

  static click(page: any, selector: string) {
    return async () => {
      await page.click(selector);
    };
  }

  static fill(page: any, selector: string, text: string) {
    return async () => {
      await page.fill(selector, text);
    };
  }

  static verify(page: any, selector: string, expected?: string) {
    return async () => {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible' });
      if (expected) {
        await element.textContent().then(text => {
          if (!text?.includes(expected)) {
            throw new Error(`Expected "${expected}" but got "${text}"`);
          }
        });
      }
    };
  }

  static screenshot(screenshotHelper: any, name: string) {
    return async () => {
      await screenshotHelper.takeScreenshot(name);
    };
  }

  static apiCall(apiClient: any, method: string, endpoint: string, data?: any) {
    return async () => {
      const response = await apiClient[method.toLowerCase()](endpoint, data);
      return response;
    };
  }
}