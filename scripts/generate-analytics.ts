#!/usr/bin/env node

import { ReportGenerator } from '../src/utils/report-generator';
import { Logger } from '../src/utils/logger';

/**
 * Script to generate analytics dashboard and reports
 */
async function generateAnalytics() {
  const logger = new Logger();
  
  try {
    logger.info('Starting analytics generation...');
    
    const reportGenerator = new ReportGenerator();
    await reportGenerator.generateCompleteReport();
    
    logger.info('Analytics generation completed successfully!');
    logger.info('Reports generated:');
    logger.info('  - Main Dashboard: analytics/dashboard/index.html');
    logger.info('  - Mobile Report: analytics/mobile-report.html');
    logger.info('  - Accessibility Report: analytics/accessibility-report.html');
    logger.info('  - Performance Report: analytics/performance-report.html');
    
  } catch (error) {
    logger.error(`Analytics generation failed: ${error}`);
    process.exit(1);
  }
}

// Run the script
generateAnalytics().catch(console.error);