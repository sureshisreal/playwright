import { chromium, FullConfig } from '@playwright/test';
import { testConfig } from './src/config/test-config';
import { Logger } from './src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  const logger = new Logger();
  
  logger.info('Starting global setup');
  
  try {
    // Create necessary directories
    await createDirectories();
    
    // Setup authentication if needed
    await setupAuthentication();
    
    // Setup test data
    await setupTestData();
    
    // Setup environment
    await setupEnvironment();
    
    // Setup database if needed
    await setupDatabase();
    
    // Setup external services
    await setupExternalServices();
    
    logger.info('Global setup completed successfully');
  } catch (error) {
    logger.error(`Global setup failed: ${error}`);
    throw error;
  }
}

/**
 * Create necessary directories for test artifacts
 */
async function createDirectories(): Promise<void> {
  const logger = new Logger();
  
  const directories = [
    'test-results',
    'allure-results',
    'videos',
    'screenshots',
    'logs',
    'artillery-screenshots',
    'artillery-videos',
    'performance-results',
    'test-data/generated',
    'test-data/temp'
  ];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  }
}

/**
 * Setup authentication state for tests
 */
async function setupAuthentication(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Setting up authentication');
    
    // Launch browser for authentication setup
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to login page
    await page.goto(`${testConfig.baseUrl}/login`);
    
    // Perform authentication if login page exists
    try {
      await page.waitForSelector('[data-testid="username-input"]', { timeout: 5000 });
      
      // Fill login form
      await page.fill('[data-testid="username-input"]', testConfig.username);
      await page.fill('[data-testid="password-input"]', testConfig.password);
      await page.click('[data-testid="login-button"]');
      
      // Wait for authentication to complete
      await page.waitForLoadState('networkidle');
      
      // Save authentication state
      const authDir = '.auth';
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir);
      }
      
      await context.storageState({ path: '.auth/user.json' });
      logger.info('Authentication state saved');
      
    } catch (error) {
      logger.warn('Login page not found or authentication failed - continuing without auth');
    }
    
    await browser.close();
    
  } catch (error) {
    logger.error(`Authentication setup failed: ${error}`);
    // Don't throw error as auth might not be required
  }
}

/**
 * Setup test data
 */
async function setupTestData(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Setting up test data');
    
    // Create test data directory structure
    const testDataDir = 'test-data';
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Create sample test data files
    const sampleData = {
      users: [
        {
          id: 1,
          username: 'testuser1',
          email: 'test1@example.com',
          role: 'user'
        },
        {
          id: 2,
          username: 'testuser2',
          email: 'test2@example.com',
          role: 'admin'
        }
      ],
      products: [
        {
          id: 1,
          name: 'Test Product 1',
          price: 99.99,
          category: 'electronics'
        },
        {
          id: 2,
          name: 'Test Product 2',
          price: 149.99,
          category: 'books'
        }
      ]
    };
    
    // Save test data to files
    fs.writeFileSync(
      path.join(testDataDir, 'sample-users.json'),
      JSON.stringify(sampleData.users, null, 2)
    );
    
    fs.writeFileSync(
      path.join(testDataDir, 'sample-products.json'),
      JSON.stringify(sampleData.products, null, 2)
    );
    
    logger.info('Test data setup completed');
    
  } catch (error) {
    logger.error(`Test data setup failed: ${error}`);
  }
}

/**
 * Setup environment variables and configuration
 */
async function setupEnvironment(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Setting up environment');
    
    // Validate required environment variables
    const requiredEnvVars = ['BASE_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    // Set default values for missing variables
    if (!process.env.BASE_URL) {
      process.env.BASE_URL = 'http://localhost:3000';
      logger.info('Set default BASE_URL: http://localhost:3000');
    }
    
    if (!process.env.API_BASE_URL) {
      process.env.API_BASE_URL = 'http://localhost:8000';
      logger.info('Set default API_BASE_URL: http://localhost:8000');
    }
    
    // Log environment configuration
    logger.info(`Environment: ${testConfig.environment}`);
    logger.info(`Base URL: ${testConfig.baseUrl}`);
    logger.info(`API Base URL: ${testConfig.apiBaseUrl}`);
    logger.info(`Workers: ${testConfig.workers}`);
    logger.info(`Browsers: ${testConfig.browsers.join(', ')}`);
    
  } catch (error) {
    logger.error(`Environment setup failed: ${error}`);
    throw error;
  }
}

/**
 * Setup database if needed
 */
async function setupDatabase(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Setting up database');
    
    // Check if database URL is configured
    if (!testConfig.dbUrl) {
      logger.info('No database URL configured, skipping database setup');
      return;
    }
    
    // Database setup would go here
    // This is a placeholder for actual database setup
    logger.info('Database setup completed');
    
  } catch (error) {
    logger.error(`Database setup failed: ${error}`);
    // Don't throw error as database might not be required
  }
}

/**
 * Setup external services
 */
async function setupExternalServices(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Setting up external services');
    
    // Check API connectivity
    await checkApiConnectivity();
    
    // Setup Qase integration if configured
    if (testConfig.qaseApiToken && testConfig.qaseApiToken !== 'default_qase_token') {
      logger.info('Qase integration configured');
    }
    
    // Setup Slack notifications if configured
    if (testConfig.slackWebhook) {
      logger.info('Slack notifications configured');
    }
    
    logger.info('External services setup completed');
    
  } catch (error) {
    logger.error(`External services setup failed: ${error}`);
  }
}

/**
 * Check API connectivity
 */
async function checkApiConnectivity(): Promise<void> {
  const logger = new Logger();
  
  try {
    const response = await fetch(`${testConfig.apiBaseUrl}/health`);
    if (response.ok) {
      logger.info('API connectivity check passed');
    } else {
      logger.warn(`API connectivity check failed: ${response.status}`);
    }
  } catch (error) {
    logger.warn(`API connectivity check failed: ${error}`);
  }
}

/**
 * Create environment info file for Allure
 */
async function createEnvironmentInfo(): Promise<void> {
  const logger = new Logger();
  
  try {
    const environmentInfo = {
      'Test Environment': testConfig.environment,
      'Base URL': testConfig.baseUrl,
      'API Base URL': testConfig.apiBaseUrl,
      'Node Version': process.version,
      'Platform': process.platform,
      'Timestamp': new Date().toISOString(),
      'Workers': testConfig.workers,
      'Browsers': testConfig.browsers.join(', '),
    };
    
    const envContent = Object.entries(environmentInfo)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync('allure-results/environment.properties', envContent);
    logger.info('Environment info file created for Allure');
    
  } catch (error) {
    logger.error(`Failed to create environment info file: ${error}`);
  }
}

/**
 * Setup performance monitoring
 */
async function setupPerformanceMonitoring(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Setting up performance monitoring');
    
    // Create performance results directory
    const perfDir = 'performance-results';
    if (!fs.existsSync(perfDir)) {
      fs.mkdirSync(perfDir, { recursive: true });
    }
    
    // Setup performance thresholds
    const thresholds = {
      loadTime: testConfig.performanceThresholds.loadTime,
      firstContentfulPaint: testConfig.performanceThresholds.firstContentfulPaint,
      largestContentfulPaint: testConfig.performanceThresholds.largestContentfulPaint,
      cumulativeLayoutShift: testConfig.performanceThresholds.cumulativeLayoutShift,
    };
    
    fs.writeFileSync(
      path.join(perfDir, 'thresholds.json'),
      JSON.stringify(thresholds, null, 2)
    );
    
    logger.info('Performance monitoring setup completed');
    
  } catch (error) {
    logger.error(`Performance monitoring setup failed: ${error}`);
  }
}

/**
 * Cleanup old test results
 */
async function cleanupOldResults(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Cleaning up old test results');
    
    const dirsToClean = [
      'test-results',
      'allure-results',
      'videos',
      'screenshots',
      'performance-results'
    ];
    
    for (const dir of dirsToClean) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          // Delete files older than 7 days
          const dayInMs = 24 * 60 * 60 * 1000;
          const sevenDaysAgo = new Date(Date.now() - (7 * dayInMs));
          
          if (stats.mtime < sevenDaysAgo) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted old file: ${filePath}`);
          }
        }
      }
    }
    
    logger.info('Cleanup completed');
    
  } catch (error) {
    logger.error(`Cleanup failed: ${error}`);
  }
}

// Initialize all setup tasks
async function initializeSetup(config: FullConfig): Promise<void> {
  const logger = new Logger();
  
  try {
    // Run setup tasks in parallel where possible
    await Promise.all([
      createDirectories(),
      setupTestData(),
      setupEnvironment(),
      createEnvironmentInfo(),
      setupPerformanceMonitoring(),
      cleanupOldResults()
    ]);
    
    // Run tasks that depend on others sequentially
    await setupAuthentication();
    await setupDatabase();
    await setupExternalServices();
    
    logger.info('All setup tasks completed successfully');
    
  } catch (error) {
    logger.error(`Setup initialization failed: ${error}`);
    throw error;
  }
}

export default async function(config: FullConfig) {
  await initializeSetup(config);
}
