import { test, expect } from '../../src/fixtures/test-fixtures';
import { ExamplePage } from '../../src/pages/example-page';

test.describe('Example UI Tests', () => {
  let examplePage: ExamplePage;

  test.beforeEach(async ({ page, allureHelper }) => {
    examplePage = new ExamplePage(page);
    
    await allureHelper.addStep('Navigate to application', async () => {
      await examplePage.navigate();
    });
  });

  test('should display page elements correctly', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Verify that all main page elements are displayed correctly');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['ui', 'smoke', 'regression']);
    allureHelper.addOwner('test-team');

    await allureHelper.addStep('Verify page elements are loaded', async () => {
      await examplePage.verifyPageElementsLoaded();
    });

    await allureHelper.addStep('Take screenshot of loaded page', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('page_loaded');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Page Loaded');
    });

    await allureHelper.addStep('Verify page title', async () => {
      await examplePage.verifyTitle();
    });

    await allureHelper.addStep('Verify page URL', async () => {
      await examplePage.verifyUrl();
    });

    logger.pass('Page elements displayed correctly');
  });

  test('should handle user login successfully', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper, 
    testData 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test user login functionality with valid credentials');
    allureHelper.addSeverity('blocker');
    allureHelper.addTags(['ui', 'authentication', 'critical']);
    allureHelper.addOwner('auth-team');

    // Generate test user data
    const userData = testData.generateUserData();
    allureHelper.addParameter('Username', userData.username);
    allureHelper.addParameter('Email', userData.email);

    await allureHelper.addStep('Perform user login', async () => {
      await examplePage.login(userData.username, userData.password);
    });

    await allureHelper.addStep('Verify login success', async () => {
      const isLoggedIn = await examplePage.isVisible('[data-testid="user-profile"]');
      expect(isLoggedIn).toBeTruthy();
    });

    await allureHelper.addStep('Take screenshot after login', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('user_logged_in');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'User Logged In');
    });

    logger.pass('User login successful');
  });

  test('should search for products', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test product search functionality');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['ui', 'search', 'functionality']);
    allureHelper.addOwner('product-team');

    const searchTerm = 'laptop';
    allureHelper.addParameter('Search Term', searchTerm);

    await allureHelper.addStep('Perform product search', async () => {
      await examplePage.searchProducts(searchTerm);
    });

    await allureHelper.addStep('Verify search results', async () => {
      const productTitles = await examplePage.getAllProductTitles();
      expect(productTitles.length).toBeGreaterThan(0);
      
      // Verify search results contain the search term
      const relevantResults = productTitles.filter(title => 
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(relevantResults.length).toBeGreaterThan(0);
    });

    await allureHelper.addStep('Take screenshot of search results', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('search_results');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Search Results');
    });

    logger.pass('Product search completed successfully');
  });

  test('should add product to cart', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper, 
    testData 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test adding product to shopping cart');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['ui', 'cart', 'e-commerce']);
    allureHelper.addOwner('cart-team');

    // Generate test user and login first
    const userData = testData.generateUserData();
    
    await allureHelper.addStep('Login user', async () => {
      await examplePage.login(userData.username, userData.password);
    });

    await allureHelper.addStep('Search for products', async () => {
      await examplePage.searchProducts('phone');
    });

    await allureHelper.addStep('Get product information', async () => {
      const productInfo = await examplePage.getProductInfo(0);
      allureHelper.addParameter('Product Title', productInfo.title);
      allureHelper.addParameter('Product Price', productInfo.price);
    });

    await allureHelper.addStep('Add product to cart', async () => {
      await examplePage.addProductToCart(0);
    });

    await allureHelper.addStep('Verify cart count updated', async () => {
      const cartCount = await examplePage.getCartCount();
      expect(cartCount).toBeGreaterThan(0);
    });

    await allureHelper.addStep('Take screenshot after adding to cart', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('product_added_to_cart');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Product Added to Cart');
    });

    logger.pass('Product added to cart successfully');
  });

  test('should handle cart operations', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper, 
    testData 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test cart operations including open, close, and checkout');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['ui', 'cart', 'checkout']);
    allureHelper.addOwner('cart-team');

    // Setup: Login and add product to cart
    const userData = testData.generateUserData();
    
    await allureHelper.addStep('Setup: Login and add product', async () => {
      await examplePage.login(userData.username, userData.password);
      await examplePage.searchProducts('tablet');
      await examplePage.addProductToCart(0);
    });

    await allureHelper.addStep('Open cart modal', async () => {
      await examplePage.openCartModal();
    });

    await allureHelper.addStep('Verify cart modal is visible', async () => {
      const isModalVisible = await examplePage.isVisible('[data-testid="cart-modal"]');
      expect(isModalVisible).toBeTruthy();
    });

    await allureHelper.addStep('Take screenshot of cart modal', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('cart_modal_open');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Cart Modal Open');
    });

    await allureHelper.addStep('Close cart modal', async () => {
      await examplePage.closeCartModal();
    });

    await allureHelper.addStep('Verify cart modal is closed', async () => {
      const isModalHidden = !(await examplePage.isVisible('[data-testid="cart-modal"]'));
      expect(isModalHidden).toBeTruthy();
    });

    logger.pass('Cart operations completed successfully');
  });

  test('should handle pagination', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test pagination functionality');
    allureHelper.addSeverity('minor');
    allureHelper.addTags(['ui', 'pagination', 'navigation']);
    allureHelper.addOwner('ui-team');

    await allureHelper.addStep('Search for products to enable pagination', async () => {
      await examplePage.searchProducts('electronics');
    });

    await allureHelper.addStep('Get current page number', async () => {
      const currentPage = await examplePage.getCurrentPageNumber();
      allureHelper.addParameter('Initial Page', currentPage.toString());
      expect(currentPage).toBe(1);
    });

    await allureHelper.addStep('Navigate to next page', async () => {
      await examplePage.goToNextPage();
    });

    await allureHelper.addStep('Verify page changed', async () => {
      const newPage = await examplePage.getCurrentPageNumber();
      expect(newPage).toBe(2);
    });

    await allureHelper.addStep('Take screenshot of second page', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('pagination_page_2');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Pagination Page 2');
    });

    await allureHelper.addStep('Navigate back to previous page', async () => {
      await examplePage.goToPreviousPage();
    });

    await allureHelper.addStep('Verify back to first page', async () => {
      const backToFirstPage = await examplePage.getCurrentPageNumber();
      expect(backToFirstPage).toBe(1);
    });

    logger.pass('Pagination functionality working correctly');
  });

  test('should handle error messages', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test error message handling');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['ui', 'error-handling', 'validation']);
    allureHelper.addOwner('qa-team');

    await allureHelper.addStep('Attempt invalid search', async () => {
      await examplePage.searchProducts('nonexistentproduct12345');
    });

    await allureHelper.addStep('Check for error message', async () => {
      // Wait a bit for potential error message
      await page.waitForTimeout(2000);
      
      const hasErrorMessage = await examplePage.isErrorMessageDisplayed();
      if (hasErrorMessage) {
        const errorMessage = await examplePage.getErrorMessage();
        allureHelper.addParameter('Error Message', errorMessage);
        
        await allureHelper.addStep('Take screenshot of error', async () => {
          const screenshotPath = await screenshotHelper.takeScreenshot('error_message');
          await allureHelper.addScreenshotAttachment(screenshotPath, 'Error Message');
        });
      }
    });

    logger.pass('Error handling test completed');
  });

  test('should handle loading states', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test loading state handling');
    allureHelper.addSeverity('minor');
    allureHelper.addTags(['ui', 'loading', 'user-experience']);
    allureHelper.addOwner('ui-team');

    await allureHelper.addStep('Perform search and wait for loading', async () => {
      await examplePage.searchProducts('books');
      await examplePage.waitForLoadingToComplete();
    });

    await allureHelper.addStep('Verify content is loaded', async () => {
      const productTitles = await examplePage.getAllProductTitles();
      expect(productTitles.length).toBeGreaterThan(0);
    });

    await allureHelper.addStep('Take screenshot of loaded content', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('content_loaded');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Content Loaded');
    });

    logger.pass('Loading states handled correctly');
  });

  test.afterEach(async ({ page, logger, screenshotHelper, videoHelper, allureHelper }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status === 'failed') {
      const screenshotPath = await screenshotHelper.takeFailureScreenshot();
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Failure Screenshot');
      
      const videoPath = await videoHelper.saveFailureVideo();
      if (videoPath) {
        await allureHelper.addVideoAttachment(videoPath, 'Failure Video');
      }
    }

    // Add test duration
    if (testInfo.duration) {
      allureHelper.addParameter('Test Duration', `${testInfo.duration}ms`);
    }

    logger.info(`Test ${testInfo.title} completed with status: ${testInfo.status}`);
  });
});
