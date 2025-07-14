import * as fs from 'fs';
import * as path from 'path';

/**
 * Custom logger with different log levels and file output
 */
export class Logger {
  private logLevel: LogLevel;
  private logFile: string;
  private logDir: string;

  constructor(logLevel: LogLevel = LogLevel.INFO, logDir: string = 'logs') {
    this.logLevel = logLevel;
    this.logDir = logDir;
    this.logFile = path.join(logDir, `test-${new Date().toISOString().split('T')[0]}.log`);
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const testInfo = this.getTestInfo();
    return `[${timestamp}] [${level}] ${testInfo} ${message}`;
  }

  private getTestInfo(): string {
    const testTitle = process.env.PLAYWRIGHT_TEST_TITLE || '';
    const testFile = process.env.PLAYWRIGHT_TEST_FILE || '';
    return testTitle ? `[${testFile}:${testTitle}]` : '[Unknown Test]';
  }

  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  public debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage('DEBUG', message);
      console.debug(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  public info(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage('INFO', message);
      console.info(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  public warn(message: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage('WARN', message);
      console.warn(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  public error(message: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage('ERROR', message);
      console.error(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  public fatal(message: string): void {
    const formattedMessage = this.formatMessage('FATAL', message);
    console.error(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  public step(message: string): void {
    const formattedMessage = this.formatMessage('STEP', message);
    console.info(`🔹 ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  public pass(message: string): void {
    const formattedMessage = this.formatMessage('PASS', message);
    console.info(`✅ ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  public fail(message: string): void {
    const formattedMessage = this.formatMessage('FAIL', message);
    console.error(`❌ ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  public startTest(testName: string): void {
    const message = `Starting test: ${testName}`;
    const formattedMessage = this.formatMessage('TEST_START', message);
    console.info(`🚀 ${formattedMessage}`);
    this.writeToFile(formattedMessage);
    this.writeToFile('='.repeat(80));
  }

  public endTest(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED'): void {
    const message = `Test completed: ${testName} - ${status}`;
    const formattedMessage = this.formatMessage('TEST_END', message);
    const icon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⏭️';
    console.info(`${icon} ${formattedMessage}`);
    this.writeToFile(formattedMessage);
    this.writeToFile('='.repeat(80));
  }

  public performance(message: string, duration: number): void {
    const perfMessage = `${message} - Duration: ${duration}ms`;
    const formattedMessage = this.formatMessage('PERF', perfMessage);
    console.info(`⏱️ ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  public api(method: string, url: string, status: number, duration: number): void {
    const apiMessage = `${method} ${url} - Status: ${status} - Duration: ${duration}ms`;
    const formattedMessage = this.formatMessage('API', apiMessage);
    console.info(`🌐 ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  public screenshot(path: string): void {
    const screenshotMessage = `Screenshot saved: ${path}`;
    const formattedMessage = this.formatMessage('SCREENSHOT', screenshotMessage);
    console.info(`📸 ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  public video(path: string): void {
    const videoMessage = `Video saved: ${path}`;
    const formattedMessage = this.formatMessage('VIDEO', videoMessage);
    console.info(`🎥 ${formattedMessage}`);
    this.writeToFile(formattedMessage);
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  public getLogFile(): string {
    return this.logFile;
  }

  public clearLogs(): void {
    if (fs.existsSync(this.logFile)) {
      fs.unlinkSync(this.logFile);
    }
  }

  public archiveLogs(): void {
    if (fs.existsSync(this.logFile)) {
      const archiveFile = this.logFile.replace('.log', `_${Date.now()}.log`);
      fs.renameSync(this.logFile, archiveFile);
    }
  }
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Export singleton instance
export const logger = new Logger();
