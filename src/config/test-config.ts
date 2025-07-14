import { getConfig } from './environment';

/**
 * Test configuration with default values and environment overrides
 */
export class TestConfig {
  private static instance: TestConfig;
  private config: ReturnType<typeof getConfig>;

  private constructor() {
    this.config = getConfig();
  }

  public static getInstance(): TestConfig {
    if (!TestConfig.instance) {
      TestConfig.instance = new TestConfig();
    }
    return TestConfig.instance;
  }

  public get baseUrl(): string {
    return this.config.baseUrl;
  }

  public get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  public get timeout(): number {
    return this.config.timeout;
  }

  public get retries(): number {
    return this.config.retries;
  }

  public get headless(): boolean {
    return this.config.headless;
  }

  public get slowMo(): number {
    return this.config.slowMo;
  }

  public get video(): boolean {
    return this.config.video;
  }

  public get screenshot(): boolean {
    return this.config.screenshot;
  }

  public get trace(): boolean {
    return this.config.trace;
  }

  public get apiKey(): string {
    return this.config.apiKey;
  }

  public get username(): string {
    return this.config.username;
  }

  public get password(): string {
    return this.config.password;
  }

  public get dbUrl(): string {
    return this.config.dbUrl;
  }

  public get qaseApiToken(): string {
    return this.config.qaseApiToken;
  }

  public get qaseProject(): string {
    return this.config.qaseProject;
  }

  public get slackWebhook(): string {
    return this.config.slackWebhook;
  }

  public get emailFrom(): string {
    return this.config.emailFrom;
  }

  public get emailTo(): string {
    return this.config.emailTo;
  }

  public get browsers(): string[] {
    return this.config.browsers;
  }

  public get workers(): number {
    return this.config.workers;
  }

  public get videoDir(): string {
    return this.config.videoDir;
  }

  public get screenshotDir(): string {
    return this.config.screenshotDir;
  }

  public get axeConfig(): any {
    return this.config.axeConfig;
  }

  public get performanceThresholds(): any {
    return this.config.performanceThresholds;
  }

  public get environment(): string {
    return this.config.name;
  }

  public getAll(): ReturnType<typeof getConfig> {
    return this.config;
  }

  public updateConfig(updates: Partial<ReturnType<typeof getConfig>>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Export singleton instance
export const testConfig = TestConfig.getInstance();
