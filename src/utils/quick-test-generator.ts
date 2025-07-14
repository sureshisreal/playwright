import { TestTemplates } from '../templates/test-templates';
import { FrameworkReference } from './framework-reference';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Quick test generator for rapid test creation
 */
export class QuickTestGenerator {
  /**
   * Generate a complete test suite with minimal input
   */
  static generateQuickTest(config: {
    type: 'ui' | 'api' | 'mobile' | 'accessibility' | 'performance';
    name: string;
    url?: string;
    endpoint?: string;
    method?: string;
    device?: string;
    interactions?: any[];
  }): string {
    const fileName = `${config.name.toLowerCase().replace(/\s+/g, '-')}-${config.type}.spec.ts`;
    const testDir = path.join('tests', config.type);
    const filePath = path.join(testDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    let testContent = '';

    switch (config.type) {
      case 'ui':
        testContent = TestTemplates.generateUITest({
          testName: config.name,
          url: config.url || 'https://example.com',
          title: config.name,
          interactions: config.interactions || [
            { action: 'click', selector: '[data-test="button"]', expected: '[data-test="result"]' }
          ]
        });
        break;

      case 'api':
        testContent = TestTemplates.generateAPITest({
          testName: config.name,
          endpoint: config.endpoint || '/api/test',
          method: (config.method as any) || 'GET',
          expectedStatus: 200
        });
        break;

      case 'mobile':
        testContent = TestTemplates.generateMobileTest({
          testName: config.name,
          url: config.url || 'https://example.com',
          devices: [config.device || 'iPhone 13'],
          interactions: config.interactions || [
            { type: 'tap', selector: '[data-test="button"]' }
          ]
        });
        break;

      case 'accessibility':
        testContent = TestTemplates.generateAccessibilityTest({
          testName: config.name,
          url: config.url || 'https://example.com',
          checks: ['scan', 'contrast', 'keyboard']
        });
        break;

      case 'performance':
        testContent = TestTemplates.generatePerformanceTest({
          testName: config.name,
          url: config.url || 'https://example.com',
          thresholds: {
            loadTime: 3000,
            fcp: 1500,
            lcp: 2500
          }
        });
        break;

      default:
        throw new Error(`Unknown test type: ${config.type}`);
    }

    // Write test file
    fs.writeFileSync(filePath, testContent);
    
    return filePath;
  }

  /**
   * Generate test from command line arguments
   */
  static generateFromCLI(args: string[]): string {
    const config: any = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];
      
      switch (arg) {
        case '--type':
          config.type = nextArg;
          i++;
          break;
        case '--name':
          config.name = nextArg;
          i++;
          break;
        case '--url':
          config.url = nextArg;
          i++;
          break;
        case '--endpoint':
          config.endpoint = nextArg;
          i++;
          break;
        case '--method':
          config.method = nextArg;
          i++;
          break;
        case '--device':
          config.device = nextArg;
          i++;
          break;
      }
    }

    if (!config.type || !config.name) {
      throw new Error('--type and --name are required');
    }

    return this.generateQuickTest(config);
  }

  /**
   * Generate test optimization report
   */
  static generateOptimizationReport(testDir: string = 'tests'): string {
    const report = [];
    
    // Check for common patterns
    report.push('# Test Optimization Report\n');
    report.push('## Current Status\n');
    
    // Count test files
    const testFiles = this.getTestFiles(testDir);
    report.push(`- Total test files: ${testFiles.length}`);
    
    // Analyze test types
    const testTypes = new Map<string, number>();
    testFiles.forEach(file => {
      const dir = path.dirname(file).split(path.sep).pop();
      testTypes.set(dir!, (testTypes.get(dir!) || 0) + 1);
    });
    
    report.push('\n## Test Distribution');
    testTypes.forEach((count, type) => {
      report.push(`- ${type}: ${count} tests`);
    });
    
    // Check for optimization opportunities
    report.push('\n## Optimization Opportunities');
    
    let duplicatePatterns = 0;
    let longTests = 0;
    
    testFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      if (lines.length > 100) {
        longTests++;
      }
      
      // Check for duplicate patterns
      if (content.includes('await page.goto') && content.includes('await expect(page).toHaveTitle')) {
        duplicatePatterns++;
      }
    });
    
    report.push(`- Files with potential duplicate patterns: ${duplicatePatterns}`);
    report.push(`- Long test files (>100 lines): ${longTests}`);
    
    // Recommendations
    report.push('\n## Recommendations');
    if (duplicatePatterns > 0) {
      report.push('- Extract common navigation patterns into utilities');
    }
    if (longTests > 0) {
      report.push('- Split long test files into smaller, focused tests');
    }
    report.push('- Use test templates for consistent structure');
    report.push('- Implement shared setup/teardown functions');
    
    return report.join('\n');
  }

  /**
   * Get all test files recursively
   */
  private static getTestFiles(dir: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getTestFiles(fullPath));
      } else if (item.endsWith('.spec.ts') || item.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    });

    return files;
  }

  /**
   * Generate CLI helper script
   */
  static generateCLIHelper(): string {
    return `#!/usr/bin/env node

/**
 * Quick test generator CLI
 * Usage: node generate-test.js --type ui --name "Login Test" --url "https://example.com/login"
 */

const { QuickTestGenerator } = require('./src/utils/quick-test-generator');

try {
  const filePath = QuickTestGenerator.generateFromCLI(process.argv.slice(2));
  console.log('✅ Test generated successfully:', filePath);
  console.log('');
  console.log('🚀 To run the test:');
  console.log('npx playwright test', filePath);
  console.log('');
  console.log('📊 To view results:');
  console.log('npx playwright show-report');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('');
  console.log('📖 Usage:');
  console.log('node generate-test.js --type <ui|api|mobile|accessibility|performance> --name "Test Name" [options]');
  console.log('');
  console.log('Options:');
  console.log('  --type      Test type (required)');
  console.log('  --name      Test name (required)');
  console.log('  --url       Target URL');
  console.log('  --endpoint  API endpoint');
  console.log('  --method    HTTP method');
  console.log('  --device    Mobile device');
  console.log('');
  console.log('Examples:');
  console.log('node generate-test.js --type ui --name "Login Test" --url "https://example.com/login"');
  console.log('node generate-test.js --type api --name "Users API" --endpoint "/api/users" --method GET');
  console.log('node generate-test.js --type mobile --name "Touch Test" --device "iPhone 13"');
  process.exit(1);
}
`;
  }
}

// Export for CLI usage
if (require.main === module) {
  // This runs when the file is executed directly
  console.log(QuickTestGenerator.generateCLIHelper());
}