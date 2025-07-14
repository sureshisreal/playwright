/**
 * Environment configuration for different testing environments
 */
export interface Environment {
  name: string;
  baseUrl: string;
  apiBaseUrl: string;
  timeout: number;
  retries: number;
  headless: boolean;
  slowMo: number;
  video: boolean;
  screenshot: boolean;
  trace: boolean;
}

export const environments: Record<string, Environment> = {
  development: {
    name: 'development',
    baseUrl: 'http://localhost:3000',
    apiBaseUrl: 'http://localhost:8000',
    timeout: 30000,
    retries: 0,
    headless: false,
    slowMo: 100,
    video: true,
    screenshot: true,
    trace: true,
  },
  staging: {
    name: 'staging',
    baseUrl: process.env.STAGING_BASE_URL || 'https://staging.example.com',
    apiBaseUrl: process.env.STAGING_API_URL || 'https://api-staging.example.com',
    timeout: 45000,
    retries: 1,
    headless: true,
    slowMo: 0,
    video: true,
    screenshot: true,
    trace: true,
  },
  production: {
    name: 'production',
    baseUrl: process.env.PROD_BASE_URL || 'https://example.com',
    apiBaseUrl: process.env.PROD_API_URL || 'https://api.example.com',
    timeout: 60000,
    retries: 2,
    headless: true,
    slowMo: 0,
    video: false,
    screenshot: true,
    trace: false,
  },
};

export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development';
  return environments[env] || environments.development;
}

export function getConfig() {
  const environment = getEnvironment();
  
  return {
    ...environment,
    // API Keys and credentials
    apiKey: process.env.API_KEY || 'default_api_key',
    username: process.env.TEST_USERNAME || 'testuser',
    password: process.env.TEST_PASSWORD || 'testpass',
    
    // Database configuration
    dbUrl: process.env.DB_URL || 'postgresql://localhost:5432/testdb',
    
    // Third-party integrations
    qaseApiToken: process.env.QASE_TESTOPS_API_TOKEN || 'default_qase_token',
    qaseProject: process.env.QASE_TESTOPS_PROJECT || 'DEMO',
    
    // Slack notifications
    slackWebhook: process.env.SLACK_WEBHOOK_URL || '',
    
    // Email notifications
    emailFrom: process.env.EMAIL_FROM || 'tests@example.com',
    emailTo: process.env.EMAIL_TO || 'team@example.com',
    
    // Browser configurations
    browsers: process.env.BROWSERS?.split(',') || ['chromium', 'firefox', 'webkit'],
    
    // Parallel execution
    workers: parseInt(process.env.WORKERS || '4'),
    
    // Video and screenshot paths
    videoDir: process.env.VIDEO_DIR || 'videos',
    screenshotDir: process.env.SCREENSHOT_DIR || 'screenshots',
    
    // Accessibility testing
    axeConfig: {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
      },
    },
    
    // Performance testing
    performanceThresholds: {
      loadTime: 3000,
      firstContentfulPaint: 2000,
      largestContentfulPaint: 4000,
      cumulativeLayoutShift: 0.1,
    },
  };
}
