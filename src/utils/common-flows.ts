/**
 * Common test flows for reuse across tests
 */
export class CommonFlows {
  /**
   * Standard login flow
   */
  static async login(page: any, username: string, password: string) {
    await page.goto('/login');
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
    await page.waitForSelector('[data-test="dashboard"]');
  }

  /**
   * Standard search flow
   */
  static async search(page: any, searchTerm: string) {
    await page.fill('[data-test="search-input"]', searchTerm);
    await page.click('[data-test="search-button"]');
    await page.waitForSelector('[data-test="search-results"]');
  }

  /**
   * Add to cart flow
   */
  static async addToCart(page: any, productIndex: number = 0) {
    const products = page.locator('[data-test="product-card"]');
    await products.nth(productIndex).locator('[data-test="add-to-cart"]').click();
    await page.waitForSelector('[data-test="cart-updated"]');
  }

  /**
   * API authentication flow
   */
  static async authenticateAPI(apiClient: any, credentials: any) {
    const response = await apiClient.post('/auth/login', credentials);
    const token = response.data.token;
    apiClient.setAuthToken(token);
    return token;
  }

  /**
   * Mobile device setup flow
   */
  static async setupMobile(mobileHelper: any, deviceName: string) {
    await mobileHelper.setDevice(deviceName);
    return await mobileHelper.getDeviceInfo();
  }

  /**
   * Accessibility scan flow
   */
  static async runA11yScan(accessibilityHelper: any) {
    await accessibilityHelper.initialize();
    const results = await accessibilityHelper.scanPage();
    return results;
  }

  /**
   * Performance monitoring flow
   */
  static async monitorPerformance(performanceHelper: any, page: any, url: string) {
    await performanceHelper.startMonitoring();
    await page.goto(url);
    const metrics = await performanceHelper.collectMetrics();
    await performanceHelper.stopMonitoring();
    return metrics;
  }
}