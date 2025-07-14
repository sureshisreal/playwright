import { request, APIRequestContext } from '@playwright/test';
import { Logger } from './logger';
import { testConfig } from '../config/test-config';

/**
 * API client for making HTTP requests with comprehensive error handling
 */
export class ApiClient {
  private context: APIRequestContext | null = null;
  private baseUrl: string;
  private logger: Logger;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = testConfig.apiBaseUrl) {
    this.baseUrl = baseUrl;
    this.logger = new Logger();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Playwright-Test-Framework',
    };
  }

  /**
   * Initialize API request context
   */
  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: this.defaultHeaders,
      ignoreHTTPSErrors: true,
    });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set API key
   */
  setApiKey(key: string, headerName: string = 'X-API-Key'): void {
    this.defaultHeaders[headerName] = key;
  }

  /**
   * Add custom header
   */
  addHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remove header
   */
  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Make GET request
   */
  async get(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.context) {
        await this.init();
      }

      const url = this.buildUrl(endpoint, params);
      const response = await this.context!.get(url, {
        headers: { ...this.defaultHeaders, ...headers },
      });

      const duration = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      this.logger.api('GET', url, response.status(), duration);

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: responseData,
        url: response.url(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET request failed: ${endpoint} - ${error}`);
      throw new ApiError(`GET request failed: ${endpoint}`, error as Error, duration);
    }
  }

  /**
   * Make POST request
   */
  async post(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.context) {
        await this.init();
      }

      const response = await this.context!.post(endpoint, {
        data: data ? JSON.stringify(data) : undefined,
        headers: { ...this.defaultHeaders, ...headers },
      });

      const duration = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      this.logger.api('POST', endpoint, response.status(), duration);

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: responseData,
        url: response.url(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`POST request failed: ${endpoint} - ${error}`);
      throw new ApiError(`POST request failed: ${endpoint}`, error as Error, duration);
    }
  }

  /**
   * Make PUT request
   */
  async put(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.context) {
        await this.init();
      }

      const response = await this.context!.put(endpoint, {
        data: data ? JSON.stringify(data) : undefined,
        headers: { ...this.defaultHeaders, ...headers },
      });

      const duration = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      this.logger.api('PUT', endpoint, response.status(), duration);

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: responseData,
        url: response.url(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`PUT request failed: ${endpoint} - ${error}`);
      throw new ApiError(`PUT request failed: ${endpoint}`, error as Error, duration);
    }
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.context) {
        await this.init();
      }

      const response = await this.context!.delete(endpoint, {
        headers: { ...this.defaultHeaders, ...headers },
      });

      const duration = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      this.logger.api('DELETE', endpoint, response.status(), duration);

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: responseData,
        url: response.url(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`DELETE request failed: ${endpoint} - ${error}`);
      throw new ApiError(`DELETE request failed: ${endpoint}`, error as Error, duration);
    }
  }

  /**
   * Make PATCH request
   */
  async patch(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.context) {
        await this.init();
      }

      const response = await this.context!.patch(endpoint, {
        data: data ? JSON.stringify(data) : undefined,
        headers: { ...this.defaultHeaders, ...headers },
      });

      const duration = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      this.logger.api('PATCH', endpoint, response.status(), duration);

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: responseData,
        url: response.url(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`PATCH request failed: ${endpoint} - ${error}`);
      throw new ApiError(`PATCH request failed: ${endpoint}`, error as Error, duration);
    }
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint: string, filePath: string, fieldName: string = 'file', additionalData?: Record<string, any>): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.context) {
        await this.init();
      }

      const formData = new FormData();
      formData.append(fieldName, filePath);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await this.context!.post(endpoint, {
        multipart: {
          [fieldName]: filePath,
          ...additionalData,
        },
        headers: { ...this.defaultHeaders },
      });

      const duration = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      this.logger.api('POST (upload)', endpoint, response.status(), duration);

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: responseData,
        url: response.url(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`File upload failed: ${endpoint} - ${error}`);
      throw new ApiError(`File upload failed: ${endpoint}`, error as Error, duration);
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;
    
    const url = new URL(endpoint, this.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    
    return url.toString();
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse(response: any): Promise<any> {
    const contentType = response.headers()['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        this.logger.warn('Failed to parse JSON response');
        return await response.text();
      }
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else {
      return await response.body();
    }
  }

  /**
   * Validate response status
   */
  validateStatus(response: ApiResponse, expectedStatus: number | number[]): void {
    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    
    if (!expected.includes(response.status)) {
      throw new ApiError(
        `Expected status ${expected.join(' or ')}, got ${response.status}`,
        new Error(`Status validation failed`),
        0
      );
    }
  }

  /**
   * Validate response schema
   */
  validateSchema(response: ApiResponse, schema: any): void {
    // Simple schema validation - can be extended with proper JSON schema validation
    try {
      if (typeof schema === 'object' && schema !== null) {
        this.validateObject(response.data, schema);
      }
    } catch (error) {
      throw new ApiError(
        `Schema validation failed: ${error}`,
        error as Error,
        0
      );
    }
  }

  /**
   * Simple object validation
   */
  private validateObject(data: any, schema: any): void {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Data is not an object');
    }

    Object.keys(schema).forEach(key => {
      if (!(key in data)) {
        throw new Error(`Missing required property: ${key}`);
      }

      const expectedType = schema[key];
      const actualType = typeof data[key];

      if (expectedType === 'array' && !Array.isArray(data[key])) {
        throw new Error(`Property ${key} should be an array`);
      } else if (expectedType !== 'array' && actualType !== expectedType) {
        throw new Error(`Property ${key} should be ${expectedType}, got ${actualType}`);
      }
    });
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }
}

/**
 * API Response interface
 */
export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  url: string;
  duration: number;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  public originalError: Error;
  public duration: number;

  constructor(message: string, originalError: Error, duration: number) {
    super(message);
    this.name = 'ApiError';
    this.originalError = originalError;
    this.duration = duration;
  }
}
