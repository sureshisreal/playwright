import { FullConfig } from '@playwright/test';
import { Logger } from './src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global teardown for Playwright tests
 * This runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  const logger = new Logger();
  
  logger.info('Starting global teardown');
  
  try {
    // Generate test reports
    await generateTestReports();
    
    // Cleanup test data
    await cleanupTestData();
    
    // Archive artifacts
    await archiveArtifacts();
    
    // Send notifications
    await sendNotifications();
    
    // Cleanup temporary resources
    await cleanupTempResources();
    
    // Generate final summary
    await generateFinalSummary();
    
    logger.info('Global teardown completed successfully');
  } catch (error) {
    logger.error(`Global teardown failed: ${error}`);
    // Don't throw error to avoid masking test failures
  }
}

/**
 * Generate test reports
 */
async function generateTestReports(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Generating test reports');
    
    // Generate Allure report if results exist
    if (fs.existsSync('allure-results')) {
      const allureFiles = fs.readdirSync('allure-results');
      if (allureFiles.length > 0) {
        logger.info('Allure results found, report can be generated with: npm run allure:generate');
      }
    }
    
    // Generate custom test summary
    await generateTestSummary();
    
    // Generate performance report
    await generatePerformanceReport();
    
    logger.info('Test reports generation completed');
    
  } catch (error) {
    logger.error(`Test reports generation failed: ${error}`);
  }
}

/**
 * Generate test summary
 */
async function generateTestSummary(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Generating test summary');
    
    // Read test results if available
    const testResultsPath = 'test-results/results.json';
    if (fs.existsSync(testResultsPath)) {
      const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf-8'));
      
      const summary = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        totalTests: results.suites?.reduce((sum: number, suite: any) => 
          sum + suite.specs?.length || 0, 0) || 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        browser: 'chromium', // Default browser
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      };
      
      // Calculate test statistics
      if (results.suites) {
        results.suites.forEach((suite: any) => {
          if (suite.specs) {
            suite.specs.forEach((spec: any) => {
              if (spec.tests) {
                spec.tests.forEach((test: any) => {
                  if (test.results) {
                    test.results.forEach((result: any) => {
                      switch (result.status) {
                        case 'passed':
                          summary.passed++;
                          break;
                        case 'failed':
                          summary.failed++;
                          break;
                        case 'skipped':
                          summary.skipped++;
                          break;
                      }
                      summary.duration += result.duration || 0;
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      // Save summary
      fs.writeFileSync(
        'test-results/summary.json',
        JSON.stringify(summary, null, 2)
      );
      
      // Generate HTML summary
      const htmlSummary = generateHtmlSummary(summary);
      fs.writeFileSync('test-results/summary.html', htmlSummary);
      
      logger.info(`Test summary: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`);
    }
    
  } catch (error) {
    logger.error(`Test summary generation failed: ${error}`);
  }
}

/**
 * Generate HTML summary
 */
function generateHtmlSummary(summary: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
        .metric { margin: 10px 0; }
        .header { background-color: #f5f5f5; padding: 10px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Execution Summary</h1>
        <p><strong>Timestamp:</strong> ${summary.timestamp}</p>
        <p><strong>Environment:</strong> ${summary.environment}</p>
        <p><strong>Base URL:</strong> ${summary.baseUrl}</p>
    </div>
    
    <div class="summary">
        <h2>Test Results</h2>
        <div class="metric"><strong>Total Tests:</strong> ${summary.totalTests}</div>
        <div class="metric passed"><strong>Passed:</strong> ${summary.passed}</div>
        <div class="metric failed"><strong>Failed:</strong> ${summary.failed}</div>
        <div class="metric skipped"><strong>Skipped:</strong> ${summary.skipped}</div>
        <div class="metric"><strong>Duration:</strong> ${Math.round(summary.duration / 1000)} seconds</div>
        <div class="metric"><strong>Success Rate:</strong> ${summary.totalTests > 0 ? Math.round((summary.passed / summary.totalTests) * 100) : 0}%</div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate performance report
 */
async function generatePerformanceReport(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Generating performance report');
    
    const perfResultsDir = 'performance-results';
    if (!fs.existsSync(perfResultsDir)) {
      return;
    }
    
    const perfFiles = fs.readdirSync(perfResultsDir);
    const perfData: any[] = [];
    
    // Collect performance data
    for (const file of perfFiles) {
      if (file.endsWith('.json') && file !== 'thresholds.json') {
        const filePath = path.join(perfResultsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        perfData.push(data);
      }
    }
    
    // Generate performance summary
    if (perfData.length > 0) {
      const perfSummary = {
        timestamp: new Date().toISOString(),
        totalTests: perfData.length,
        averageLoadTime: perfData.reduce((sum, data) => sum + (data.loadTime || 0), 0) / perfData.length,
        averageFCP: perfData.reduce((sum, data) => sum + (data.firstContentfulPaint || 0), 0) / perfData.length,
        averageLCP: perfData.reduce((sum, data) => sum + (data.largestContentfulPaint || 0), 0) / perfData.length,
        tests: perfData,
      };
      
      fs.writeFileSync(
        path.join(perfResultsDir, 'performance-summary.json'),
        JSON.stringify(perfSummary, null, 2)
      );
      
      logger.info(`Performance report generated: ${perfData.length} tests analyzed`);
    }
    
  } catch (error) {
    logger.error(`Performance report generation failed: ${error}`);
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Cleaning up test data');
    
    // Clean up temporary test data
    const tempDataDir = 'test-data/temp';
    if (fs.existsSync(tempDataDir)) {
      const files = fs.readdirSync(tempDataDir);
      for (const file of files) {
        const filePath = path.join(tempDataDir, file);
        fs.unlinkSync(filePath);
      }
      logger.info('Temporary test data cleaned up');
    }
    
    // Clean up generated test data
    const generatedDataDir = 'test-data/generated';
    if (fs.existsSync(generatedDataDir)) {
      const files = fs.readdirSync(generatedDataDir);
      for (const file of files) {
        const filePath = path.join(generatedDataDir, file);
        fs.unlinkSync(filePath);
      }
      logger.info('Generated test data cleaned up');
    }
    
    // Clean up authentication files
    const authDir = '.auth';
    if (fs.existsSync(authDir)) {
      const files = fs.readdirSync(authDir);
      for (const file of files) {
        const filePath = path.join(authDir, file);
        fs.unlinkSync(filePath);
      }
      logger.info('Authentication files cleaned up');
    }
    
  } catch (error) {
    logger.error(`Test data cleanup failed: ${error}`);
  }
}

/**
 * Archive artifacts
 */
async function archiveArtifacts(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Archiving artifacts');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = `archives/test-run-${timestamp}`;
    
    if (!fs.existsSync('archives')) {
      fs.mkdirSync('archives');
    }
    
    fs.mkdirSync(archiveDir, { recursive: true });
    
    // Archive directories that contain important artifacts
    const dirsToArchive = [
      'test-results',
      'allure-results',
      'screenshots',
      'videos',
      'logs',
      'performance-results'
    ];
    
    for (const dir of dirsToArchive) {
      if (fs.existsSync(dir)) {
        const targetDir = path.join(archiveDir, dir);
        fs.mkdirSync(targetDir, { recursive: true });
        
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const sourcePath = path.join(dir, file);
          const targetPath = path.join(targetDir, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, targetPath);
          }
        }
      }
    }
    
    logger.info(`Artifacts archived to: ${archiveDir}`);
    
  } catch (error) {
    logger.error(`Artifact archiving failed: ${error}`);
  }
}

/**
 * Send notifications
 */
async function sendNotifications(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Sending notifications');
    
    // Read test summary for notification content
    const summaryPath = 'test-results/summary.json';
    if (!fs.existsSync(summaryPath)) {
      logger.info('No test summary found, skipping notifications');
      return;
    }
    
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    
    // Send Slack notification if webhook is configured
    await sendSlackNotification(summary);
    
    // Send email notification if configured
    await sendEmailNotification(summary);
    
    logger.info('Notifications sent');
    
  } catch (error) {
    logger.error(`Notification sending failed: ${error}`);
  }
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(summary: any): Promise<void> {
  const logger = new Logger();
  
  try {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhook) {
      logger.info('No Slack webhook configured, skipping Slack notification');
      return;
    }
    
    const successRate = summary.totalTests > 0 ? 
      Math.round((summary.passed / summary.totalTests) * 100) : 0;
    
    const color = summary.failed > 0 ? 'danger' : 'good';
    
    const message = {
      text: 'Test Execution Report',
      attachments: [
        {
          color: color,
          fields: [
            {
              title: 'Environment',
              value: summary.environment,
              short: true
            },
            {
              title: 'Total Tests',
              value: summary.totalTests,
              short: true
            },
            {
              title: 'Passed',
              value: summary.passed,
              short: true
            },
            {
              title: 'Failed',
              value: summary.failed,
              short: true
            },
            {
              title: 'Success Rate',
              value: `${successRate}%`,
              short: true
            },
            {
              title: 'Duration',
              value: `${Math.round(summary.duration / 1000)}s`,
              short: true
            }
          ],
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
    
    const response = await fetch(slackWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (response.ok) {
      logger.info('Slack notification sent successfully');
    } else {
      logger.error(`Slack notification failed: ${response.statusText}`);
    }
    
  } catch (error) {
    logger.error(`Slack notification failed: ${error}`);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(summary: any): Promise<void> {
  const logger = new Logger();
  
  try {
    const emailFrom = process.env.EMAIL_FROM;
    const emailTo = process.env.EMAIL_TO;
    
    if (!emailFrom || !emailTo) {
      logger.info('Email configuration not found, skipping email notification');
      return;
    }
    
    // Email notification implementation would go here
    // This is a placeholder for actual email sending
    logger.info('Email notification would be sent here');
    
  } catch (error) {
    logger.error(`Email notification failed: ${error}`);
  }
}

/**
 * Cleanup temporary resources
 */
async function cleanupTempResources(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Cleaning up temporary resources');
    
    // Clean up temporary directories
    const tempDirs = ['tmp', 'temp', '.tmp'];
    for (const dir of tempDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
    
    // Clean up old log files
    const logsDir = 'logs';
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < oneWeekAgo) {
          fs.unlinkSync(filePath);
          logger.info(`Deleted old log file: ${filePath}`);
        }
      }
    }
    
    logger.info('Temporary resources cleanup completed');
    
  } catch (error) {
    logger.error(`Temporary resources cleanup failed: ${error}`);
  }
}

/**
 * Generate final summary
 */
async function generateFinalSummary(): Promise<void> {
  const logger = new Logger();
  
  try {
    logger.info('Generating final summary');
    
    const finalSummary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      execution: {
        started: process.env.TEST_START_TIME || 'unknown',
        completed: new Date().toISOString(),
        duration: process.env.TEST_START_TIME ? 
          Date.now() - parseInt(process.env.TEST_START_TIME) : 0,
      },
      artifacts: {
        videos: fs.existsSync('videos') ? fs.readdirSync('videos').length : 0,
        screenshots: fs.existsSync('screenshots') ? fs.readdirSync('screenshots').length : 0,
        logs: fs.existsSync('logs') ? fs.readdirSync('logs').length : 0,
        allureResults: fs.existsSync('allure-results') ? fs.readdirSync('allure-results').length : 0,
      },
      configuration: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        workers: process.env.WORKERS || '4',
        browsers: process.env.BROWSERS || 'chromium',
      },
    };
    
    fs.writeFileSync(
      'test-results/final-summary.json',
      JSON.stringify(finalSummary, null, 2)
    );
    
    // Log final summary
    logger.info('='.repeat(60));
    logger.info('TEST EXECUTION COMPLETED');
    logger.info('='.repeat(60));
    logger.info(`Environment: ${finalSummary.environment}`);
    logger.info(`Duration: ${Math.round(finalSummary.execution.duration / 1000)}s`);
    logger.info(`Artifacts: ${finalSummary.artifacts.videos} videos, ${finalSummary.artifacts.screenshots} screenshots`);
    logger.info(`Results: Check test-results/ directory for detailed reports`);
    logger.info('='.repeat(60));
    
  } catch (error) {
    logger.error(`Final summary generation failed: ${error}`);
  }
}

export default globalTeardown;
