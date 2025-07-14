import { test, expect } from '../../src/fixtures/test-fixtures';
import { AccessibilityHelper } from '../../src/helpers/accessibility-helper';

test.describe('Accessibility Tests', () => {
  let accessibilityHelper: AccessibilityHelper;

  test.beforeEach(async ({ page, allureHelper }) => {
    accessibilityHelper = new AccessibilityHelper(page);
    await accessibilityHelper.initialize();
    
    await allureHelper.addStep('Initialize accessibility helper', async () => {
      // Accessibility helper is initialized
    });
  });

  test('should pass accessibility scan on homepage', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Run comprehensive accessibility scan on homepage');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['accessibility', 'a11y', 'homepage', 'wcag']);
    allureHelper.addOwner('accessibility-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await allureHelper.addStep('Take screenshot before accessibility scan', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('before_accessibility_scan');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Before Accessibility Scan');
    });

    let accessibilityResults: any;

    await allureHelper.addStep('Run accessibility scan', async () => {
      accessibilityResults = await accessibilityHelper.scanPage();
    });

    await allureHelper.addStep('Add accessibility report to results', async () => {
      const report = await accessibilityHelper.generateReport(accessibilityResults);
      await allureHelper.addAccessibilityReportAttachment(accessibilityResults, 'Accessibility Report');
    });

    await allureHelper.addStep('Verify no critical accessibility violations', async () => {
      await accessibilityHelper.assertNoViolationsWithImpact(accessibilityResults, 'critical');
    });

    await allureHelper.addStep('Verify no serious accessibility violations', async () => {
      await accessibilityHelper.assertNoViolationsWithImpact(accessibilityResults, 'serious');
    });

    // Log results
    allureHelper.addParameter('Total Violations', accessibilityResults.violations.length.toString());
    allureHelper.addParameter('Passed Rules', accessibilityResults.passes.toString());
    allureHelper.addParameter('Incomplete Rules', accessibilityResults.incomplete.toString());

    logger.pass(`Accessibility scan completed: ${accessibilityResults.violations.length} violations found`);
  });

  test('should check color contrast', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Check color contrast compliance');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['accessibility', 'color-contrast', 'wcag']);
    allureHelper.addOwner('design-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    let contrastViolations: any;

    await allureHelper.addStep('Check color contrast', async () => {
      contrastViolations = await accessibilityHelper.checkColorContrast();
    });

    await allureHelper.addStep('Verify color contrast compliance', async () => {
      expect(contrastViolations.length).toBe(0);
    });

    await allureHelper.addStep('Add color contrast results to report', async () => {
      await allureHelper.addJsonAttachment(contrastViolations, 'Color Contrast Results');
    });

    allureHelper.addParameter('Contrast Violations', contrastViolations.length.toString());

    logger.pass('Color contrast check completed');
  });

  test('should test keyboard navigation', async ({ 
    page, 
    logger, 
    screenshotHelper, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test keyboard navigation accessibility');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['accessibility', 'keyboard', 'navigation']);
    allureHelper.addOwner('accessibility-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    let keyboardResults: any;

    await allureHelper.addStep('Test keyboard navigation', async () => {
      keyboardResults = await accessibilityHelper.testKeyboardNavigation();
    });

    await allureHelper.addStep('Verify focusable elements exist', async () => {
      expect(keyboardResults.focusableElements.length).toBeGreaterThan(0);
    });

    await allureHelper.addStep('Verify tab order is logical', async () => {
      expect(keyboardResults.tabOrder.length).toBeGreaterThan(0);
    });

    await allureHelper.addStep('Take screenshot during keyboard navigation', async () => {
      const screenshotPath = await screenshotHelper.takeScreenshot('keyboard_navigation');
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Keyboard Navigation');
    });

    await allureHelper.addStep('Add keyboard navigation results to report', async () => {
      await allureHelper.addJsonAttachment(keyboardResults, 'Keyboard Navigation Results');
    });

    allureHelper.addParameter('Focusable Elements', keyboardResults.focusableElements.length.toString());
    allureHelper.addParameter('Tab Order Length', keyboardResults.tabOrder.length.toString());
    allureHelper.addParameter('Has Skip Links', keyboardResults.skipLinks.toString());

    logger.pass('Keyboard navigation test completed');
  });

  test('should test screen reader compatibility', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test screen reader compatibility');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['accessibility', 'screen-reader', 'aria']);
    allureHelper.addOwner('accessibility-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    let screenReaderResults: any;

    await allureHelper.addStep('Test screen reader compatibility', async () => {
      screenReaderResults = await accessibilityHelper.testScreenReaderCompatibility();
    });

    await allureHelper.addStep('Verify landmarks exist', async () => {
      expect(screenReaderResults.landmarks.length).toBeGreaterThan(0);
    });

    await allureHelper.addStep('Verify heading structure', async () => {
      expect(screenReaderResults.headings.length).toBeGreaterThan(0);
      
      // Check if H1 exists
      const h1Headings = screenReaderResults.headings.filter((h: any) => h.level === 1);
      expect(h1Headings.length).toBeGreaterThan(0);
    });

    await allureHelper.addStep('Verify images have alt text', async () => {
      const imagesWithoutAlt = screenReaderResults.images.filter((img: any) => !img.hasAlt);
      expect(imagesWithoutAlt.length).toBe(0);
    });

    await allureHelper.addStep('Add screen reader results to report', async () => {
      await allureHelper.addJsonAttachment(screenReaderResults, 'Screen Reader Results');
    });

    allureHelper.addParameter('Landmarks Count', screenReaderResults.landmarks.length.toString());
    allureHelper.addParameter('Headings Count', screenReaderResults.headings.length.toString());
    allureHelper.addParameter('Links Count', screenReaderResults.links.length.toString());
    allureHelper.addParameter('Images Count', screenReaderResults.images.length.toString());

    logger.pass('Screen reader compatibility test completed');
  });

  test('should check ARIA attributes', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Check ARIA attributes compliance');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['accessibility', 'aria', 'attributes']);
    allureHelper.addOwner('accessibility-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    let ariaViolations: any;

    await allureHelper.addStep('Check ARIA attributes', async () => {
      ariaViolations = await accessibilityHelper.checkAriaAttributes();
    });

    await allureHelper.addStep('Verify ARIA attributes compliance', async () => {
      expect(ariaViolations.length).toBe(0);
    });

    await allureHelper.addStep('Add ARIA results to report', async () => {
      await allureHelper.addJsonAttachment(ariaViolations, 'ARIA Violations');
    });

    allureHelper.addParameter('ARIA Violations', ariaViolations.length.toString());

    logger.pass('ARIA attributes check completed');
  });

  test('should check form labels', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Check form labels accessibility');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['accessibility', 'forms', 'labels']);
    allureHelper.addOwner('accessibility-team');

    await allureHelper.addStep('Navigate to form page', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    let formViolations: any;

    await allureHelper.addStep('Check form labels', async () => {
      formViolations = await accessibilityHelper.checkFormLabels();
    });

    await allureHelper.addStep('Verify form labels compliance', async () => {
      expect(formViolations.length).toBe(0);
    });

    await allureHelper.addStep('Add form results to report', async () => {
      await allureHelper.addJsonAttachment(formViolations, 'Form Label Violations');
    });

    allureHelper.addParameter('Form Violations', formViolations.length.toString());

    logger.pass('Form labels check completed');
  });

  test('should check image alt text', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Check image alt text accessibility');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['accessibility', 'images', 'alt-text']);
    allureHelper.addOwner('content-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    let imageViolations: any;

    await allureHelper.addStep('Check image alt text', async () => {
      imageViolations = await accessibilityHelper.checkImageAltText();
    });

    await allureHelper.addStep('Verify image alt text compliance', async () => {
      expect(imageViolations.length).toBe(0);
    });

    await allureHelper.addStep('Add image results to report', async () => {
      await allureHelper.addJsonAttachment(imageViolations, 'Image Alt Text Violations');
    });

    allureHelper.addParameter('Image Violations', imageViolations.length.toString());

    logger.pass('Image alt text check completed');
  });

  test('should check heading structure', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Check heading structure accessibility');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['accessibility', 'headings', 'structure']);
    allureHelper.addOwner('content-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    let headingViolations: any;

    await allureHelper.addStep('Check heading structure', async () => {
      headingViolations = await accessibilityHelper.checkHeadingStructure();
    });

    await allureHelper.addStep('Verify heading structure compliance', async () => {
      expect(headingViolations.length).toBe(0);
    });

    await allureHelper.addStep('Add heading results to report', async () => {
      await allureHelper.addJsonAttachment(headingViolations, 'Heading Structure Violations');
    });

    allureHelper.addParameter('Heading Violations', headingViolations.length.toString());

    logger.pass('Heading structure check completed');
  });

  test('should scan specific page elements', async ({ 
    page, 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Scan specific page elements for accessibility');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['accessibility', 'element-scan', 'targeted']);
    allureHelper.addOwner('accessibility-team');

    await allureHelper.addStep('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    // Test specific elements
    const elementsToTest = [
      '[data-testid="navigation-menu"]',
      '[data-testid="main-content"]',
      '[data-testid="footer"]',
    ];

    for (const element of elementsToTest) {
      await allureHelper.addStep(`Scan element: ${element}`, async () => {
        try {
          const elementResults = await accessibilityHelper.scanElement(element);
          
          allureHelper.addParameter(`${element} Violations`, elementResults.violations.length.toString());
          
          if (elementResults.violations.length > 0) {
            await allureHelper.addJsonAttachment(elementResults, `${element} Accessibility Results`);
          }
          
          // Assert no critical violations for this element
          await accessibilityHelper.assertNoViolationsWithImpact(elementResults, 'critical');
        } catch (error) {
          logger.warn(`Element ${element} not found or scan failed: ${error}`);
        }
      });
    }

    logger.pass('Element-specific accessibility scan completed');
  });

  test.afterEach(async ({ page, logger, screenshotHelper, allureHelper }, testInfo) => {
    if (testInfo.status === 'failed') {
      const screenshotPath = await screenshotHelper.takeFailureScreenshot();
      await allureHelper.addScreenshotAttachment(screenshotPath, 'Accessibility Test Failure');
    }

    logger.info(`Accessibility test ${testInfo.title} completed with status: ${testInfo.status}`);
  });
});
