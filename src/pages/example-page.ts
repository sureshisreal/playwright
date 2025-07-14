import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Example page class demonstrating page object model implementation
 */
export class ExamplePage extends BasePage {
  // Page elements selectors
  private readonly selectors = {
    // Header elements
    logo: '[data-testid="logo"]',
    navigationMenu: '[data-testid="nav-menu"]',
    userProfile: '[data-testid="user-profile"]',
    
    // Form elements
    searchInput: '[data-testid="search-input"]',
    searchButton: '[data-testid="search-button"]',
    loginForm: '[data-testid="login-form"]',
    usernameInput: '[data-testid="username-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    logoutButton: '[data-testid="logout-button"]',
    
    // Content elements
    mainContent: '[data-testid="main-content"]',
    productList: '[data-testid="product-list"]',
    productCard: '[data-testid="product-card"]',
    productTitle: '[data-testid="product-title"]',
    productPrice: '[data-testid="product-price"]',
    addToCartButton: '[data-testid="add-to-cart"]',
    
    // Cart elements
    cartIcon: '[data-testid="cart-icon"]',
    cartCount: '[data-testid="cart-count"]',
    cartModal: '[data-testid="cart-modal"]',
    cartItems: '[data-testid="cart-items"]',
    checkoutButton: '[data-testid="checkout-button"]',
    
    // Footer elements
    footer: '[data-testid="footer"]',
    footerLinks: '[data-testid="footer-links"]',
    
    // Error/Success messages
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    
    // Modal elements
    modal: '[data-testid="modal"]',
    modalTitle: '[data-testid="modal-title"]',
    modalContent: '[data-testid="modal-content"]',
    modalCloseButton: '[data-testid="modal-close"]',
    
    // Pagination elements
    pagination: '[data-testid="pagination"]',
    nextPageButton: '[data-testid="next-page"]',
    prevPageButton: '[data-testid="prev-page"]',
    pageNumber: '[data-testid="page-number"]',
  };

  constructor(page: Page) {
    super(page, '/', 'Example App - Home');
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<void> {
    try {
      this.logger.step(`Logging in with username: ${username}`);
      
      // Click login button to open login form
      await this.click(this.selectors.loginButton);
      
      // Wait for login form to appear
      await this.waitForElement(this.selectors.loginForm);
      
      // Fill in credentials
      await this.type(this.selectors.usernameInput, username);
      await this.type(this.selectors.passwordInput, password);
      
      // Submit login form
      await this.click(this.selectors.loginButton);
      
      // Wait for login to complete
      await this.waitForElementToBeHidden(this.selectors.loginForm);
      
      // Verify user is logged in
      await this.waitForElement(this.selectors.userProfile);
      
      this.logger.pass(`Successfully logged in as: ${username}`);
    } catch (error) {
      this.logger.fail(`Failed to login: ${error}`);
      await this.screenshotHelper.takeFailureScreenshot();
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      this.logger.step('Logging out user');
      
      // Click user profile to open dropdown
      await this.click(this.selectors.userProfile);
      
      // Click logout button
      await this.click(this.selectors.logoutButton);
      
      // Verify user is logged out
      await this.waitForElement(this.selectors.loginButton);
      
      this.logger.pass('Successfully logged out');
    } catch (error) {
      this.logger.fail(`Failed to logout: ${error}`);
      await this.screenshotHelper.takeFailureScreenshot();
      throw error;
    }
  }

  /**
   * Search for products
   */
  async searchProducts(searchTerm: string): Promise<void> {
    try {
      this.logger.step(`Searching for products: ${searchTerm}`);
      
      // Clear search input and type search term
      await this.clearAndType(this.selectors.searchInput, searchTerm);
      
      // Click search button
      await this.click(this.selectors.searchButton);
      
      // Wait for search results to load
      await this.waitForElement(this.selectors.productList);
      
      this.logger.pass(`Search completed for: ${searchTerm}`);
    } catch (error) {
      this.logger.fail(`Failed to search for products: ${error}`);
      await this.screenshotHelper.takeFailureScreenshot();
      throw error;
    }
  }

  /**
   * Get product information
   */
  async getProductInfo(productIndex: number = 0): Promise<{
    title: string;
    price: string;
  }> {
    try {
      this.logger.step(`Getting product info for index: ${productIndex}`);
      
      // Wait for product list to load
      await this.waitForElement(this.selectors.productList);
      
      // Get product elements
      const productCards = await this.getAllElements(this.selectors.productCard);
      
      if (productCards.length === 0) {
        throw new Error('No products found');
      }
      
      if (productIndex >= productCards.length) {
        throw new Error(`Product index ${productIndex} out of range. Found ${productCards.length} products`);
      }
      
      // Get product title and price
      const productCard = productCards[productIndex];
      const title = await productCard.locator(this.selectors.productTitle).textContent() || '';
      const price = await productCard.locator(this.selectors.productPrice).textContent() || '';
      
      this.logger.debug(`Product info - Title: ${title}, Price: ${price}`);
      
      return { title, price };
    } catch (error) {
      this.logger.fail(`Failed to get product info: ${error}`);
      throw error;
    }
  }

  /**
   * Add product to cart
   */
  async addProductToCart(productIndex: number = 0): Promise<void> {
    try {
      this.logger.step(`Adding product to cart at index: ${productIndex}`);
      
      // Wait for product list to load
      await this.waitForElement(this.selectors.productList);
      
      // Get product elements
      const productCards = await this.getAllElements(this.selectors.productCard);
      
      if (productCards.length === 0) {
        throw new Error('No products found');
      }
      
      if (productIndex >= productCards.length) {
        throw new Error(`Product index ${productIndex} out of range. Found ${productCards.length} products`);
      }
      
      // Get current cart count
      const currentCartCount = await this.getCartCount();
      
      // Click add to cart button
      const productCard = productCards[productIndex];
      await productCard.locator(this.selectors.addToCartButton).click();
      
      // Wait for cart count to update
      await this.waitForCartCountToChange(currentCartCount);
      
      this.logger.pass(`Product added to cart successfully`);
    } catch (error) {
      this.logger.fail(`Failed to add product to cart: ${error}`);
      await this.screenshotHelper.takeFailureScreenshot();
      throw error;
    }
  }

  /**
   * Get cart count
   */
  async getCartCount(): Promise<number> {
    try {
      const cartCountText = await this.getText(this.selectors.cartCount);
      return parseInt(cartCountText) || 0;
    } catch (error) {
      this.logger.warn(`Failed to get cart count: ${error}`);
      return 0;
    }
  }

  /**
   * Wait for cart count to change
   */
  async waitForCartCountToChange(previousCount: number): Promise<void> {
    let currentCount = previousCount;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (currentCount === previousCount && attempts < maxAttempts) {
      await this.waitFor(500);
      currentCount = await this.getCartCount();
      attempts++;
    }
    
    if (currentCount === previousCount) {
      throw new Error('Cart count did not change within expected time');
    }
  }

  /**
   * Open cart modal
   */
  async openCartModal(): Promise<void> {
    try {
      this.logger.step('Opening cart modal');
      
      // Click cart icon
      await this.click(this.selectors.cartIcon);
      
      // Wait for cart modal to appear
      await this.waitForElement(this.selectors.cartModal);
      
      this.logger.pass('Cart modal opened');
    } catch (error) {
      this.logger.fail(`Failed to open cart modal: ${error}`);
      await this.screenshotHelper.takeFailureScreenshot();
      throw error;
    }
  }

  /**
   * Close cart modal
   */
  async closeCartModal(): Promise<void> {
    try {
      this.logger.step('Closing cart modal');
      
      // Click close button
      await this.click(this.selectors.modalCloseButton);
      
      // Wait for cart modal to disappear
      await this.waitForElementToBeHidden(this.selectors.cartModal);
      
      this.logger.pass('Cart modal closed');
    } catch (error) {
      this.logger.fail(`Failed to close cart modal: ${error}`);
      throw error;
    }
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    try {
      this.logger.step('Proceeding to checkout');
      
      // Open cart modal if not already open
      if (!(await this.isVisible(this.selectors.cartModal))) {
        await this.openCartModal();
      }
      
      // Click checkout button
      await this.click(this.selectors.checkoutButton);
      
      // Wait for navigation to checkout page
      await this.waitForPageLoad();
      
      this.logger.pass('Proceeded to checkout');
    } catch (error) {
      this.logger.fail(`Failed to proceed to checkout: ${error}`);
      await this.screenshotHelper.takeFailureScreenshot();
      throw error;
    }
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    try {
      this.logger.step('Navigating to next page');
      
      // Check if next page button is enabled
      const nextButton = await this.waitForElement(this.selectors.nextPageButton);
      
      if (!(await nextButton.isEnabled())) {
        throw new Error('Next page button is not enabled');
      }
      
      // Click next page button
      await this.click(this.selectors.nextPageButton);
      
      // Wait for page to load
      await this.waitForPageLoad();
      
      this.logger.pass('Navigated to next page');
    } catch (error) {
      this.logger.fail(`Failed to navigate to next page: ${error}`);
      throw error;
    }
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    try {
      this.logger.step('Navigating to previous page');
      
      // Check if previous page button is enabled
      const prevButton = await this.waitForElement(this.selectors.prevPageButton);
      
      if (!(await prevButton.isEnabled())) {
        throw new Error('Previous page button is not enabled');
      }
      
      // Click previous page button
      await this.click(this.selectors.prevPageButton);
      
      // Wait for page to load
      await this.waitForPageLoad();
      
      this.logger.pass('Navigated to previous page');
    } catch (error) {
      this.logger.fail(`Failed to navigate to previous page: ${error}`);
      throw error;
    }
  }

  /**
   * Get current page number
   */
  async getCurrentPageNumber(): Promise<number> {
    try {
      const pageNumberText = await this.getText(this.selectors.pageNumber);
      return parseInt(pageNumberText) || 1;
    } catch (error) {
      this.logger.warn(`Failed to get current page number: ${error}`);
      return 1;
    }
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isErrorMessageDisplayed()) {
      return await this.getText(this.selectors.errorMessage);
    }
    return '';
  }

  /**
   * Check if success message is displayed
   */
  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.selectors.successMessage);
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    if (await this.isSuccessMessageDisplayed()) {
      return await this.getText(this.selectors.successMessage);
    }
    return '';
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete(): Promise<void> {
    try {
      // Wait for loading spinner to appear
      await this.waitForElement(this.selectors.loadingSpinner);
      
      // Wait for loading spinner to disappear
      await this.waitForElementToBeHidden(this.selectors.loadingSpinner);
      
      this.logger.debug('Loading completed');
    } catch (error) {
      // Loading spinner might not appear if content loads quickly
      this.logger.debug('Loading spinner not found or disappeared quickly');
    }
  }

  /**
   * Get all product titles
   */
  async getAllProductTitles(): Promise<string[]> {
    try {
      await this.waitForElement(this.selectors.productList);
      
      const titleElements = await this.getAllElements(this.selectors.productTitle);
      const titles: string[] = [];
      
      for (const element of titleElements) {
        const title = await element.textContent();
        if (title) {
          titles.push(title);
        }
      }
      
      this.logger.debug(`Found ${titles.length} product titles`);
      return titles;
    } catch (error) {
      this.logger.error(`Failed to get product titles: ${error}`);
      return [];
    }
  }

  /**
   * Get all product prices
   */
  async getAllProductPrices(): Promise<string[]> {
    try {
      await this.waitForElement(this.selectors.productList);
      
      const priceElements = await this.getAllElements(this.selectors.productPrice);
      const prices: string[] = [];
      
      for (const element of priceElements) {
        const price = await element.textContent();
        if (price) {
          prices.push(price);
        }
      }
      
      this.logger.debug(`Found ${prices.length} product prices`);
      return prices;
    } catch (error) {
      this.logger.error(`Failed to get product prices: ${error}`);
      return [];
    }
  }

  /**
   * Verify page elements are loaded
   */
  async verifyPageElementsLoaded(): Promise<void> {
    try {
      this.logger.step('Verifying page elements are loaded');
      
      // Check header elements
      await this.waitForElement(this.selectors.logo);
      await this.waitForElement(this.selectors.navigationMenu);
      
      // Check main content
      await this.waitForElement(this.selectors.mainContent);
      
      // Check footer
      await this.waitForElement(this.selectors.footer);
      
      this.logger.pass('All page elements are loaded');
    } catch (error) {
      this.logger.fail(`Failed to verify page elements: ${error}`);
      await this.screenshotHelper.takeFailureScreenshot();
      throw error;
    }
  }
}
