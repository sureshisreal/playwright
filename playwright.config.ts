import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration with comprehensive integrations
 * Supports video recording, screenshots, reporting, and parallel execution
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      categories: [
        {
          name: 'Outdated tests',
          messageRegex: '.*obsolete.*',
          matchedStatuses: ['failed']
        },
        {
          name: 'Product defects',
          messageRegex: '.*product bug.*',
          matchedStatuses: ['failed']
        }
      ]
    }],
    ['playwright-qase-reporter', {
      mode: 'testops',
      debug: false,
      testops: {
        api: {
          token: process.env.QASE_TESTOPS_API_TOKEN || 'default_token',
        },
        project: process.env.QASE_TESTOPS_PROJECT || 'DEMO',
        uploadAttachments: true,
        run: {
          complete: true,
        },
      },
    }]
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Directory for artifacts */
    outputDir: 'test-results',
    
    /* Global timeout */
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    /* Accept downloads */
    acceptDownloads: true,
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome-landscape',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 853, height: 393 }
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari-landscape',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 844, height: 390 }
      },
      dependencies: ['setup'],
    },
    {
      name: 'tablet-chrome',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },
    {
      name: 'tablet-safari',
      use: { ...devices['iPad Air'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-tests',
      testMatch: /.*mobile.*\.spec\.ts/,
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'api-tests',
      testMatch: /.*api.*\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
      },
    },
    {
      name: 'accessibility-tests',
      testMatch: /.*accessibility.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'performance-tests',
      testMatch: /.*performance.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Global setup and teardown - temporarily disabled for demo */
  // globalSetup: require.resolve('./global-setup.ts'),
  // globalTeardown: require.resolve('./global-teardown.ts'),

  /* Web server configuration - disabled for standalone test framework */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },

  /* Expect configuration */
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      mode: 'only-on-failure',
      animations: 'disabled',
    },
    toMatchSnapshot: {
      mode: 'only-on-failure',
    },
  },
});
