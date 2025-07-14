import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

/**
 * Test data management utility
 */
export class TestData {
  private static instance: TestData;
  private logger: Logger;
  private dataDir: string;

  private constructor(dataDir: string = 'test-data') {
    this.logger = new Logger();
    this.dataDir = dataDir;
    this.ensureDataDirectory();
  }

  public static getInstance(dataDir?: string): TestData {
    if (!TestData.instance) {
      TestData.instance = new TestData(dataDir);
    }
    return TestData.instance;
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Load test data from JSON file
   */
  async loadFromFile<T>(filename: string): Promise<T> {
    try {
      const filepath = path.join(this.dataDir, filename);
      
      if (!fs.existsSync(filepath)) {
        throw new Error(`Test data file not found: ${filepath}`);
      }

      const content = fs.readFileSync(filepath, 'utf-8');
      const data = JSON.parse(content);
      
      this.logger.debug(`Loaded test data from: ${filepath}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to load test data from ${filename}: ${error}`);
      throw error;
    }
  }

  /**
   * Save test data to JSON file
   */
  async saveToFile<T>(filename: string, data: T): Promise<void> {
    try {
      const filepath = path.join(this.dataDir, filename);
      const content = JSON.stringify(data, null, 2);
      
      fs.writeFileSync(filepath, content);
      this.logger.debug(`Saved test data to: ${filepath}`);
    } catch (error) {
      this.logger.error(`Failed to save test data to ${filename}: ${error}`);
      throw error;
    }
  }

  /**
   * Generate random user data
   */
  generateUserData(): UserData {
    const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com'];
    
    const firstName = names[Math.floor(Math.random() * names.length)];
    const lastName = surnames[Math.floor(Math.random() * surnames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    return {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
      password: this.generatePassword(),
      phone: this.generatePhoneNumber(),
      address: this.generateAddress(),
      dateOfBirth: this.generateDateOfBirth(),
      id: this.generateId(),
    };
  }

  /**
   * Generate random password
   */
  generatePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Generate random phone number
   */
  generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    
    return `(${areaCode}) ${exchange}-${number}`;
  }

  /**
   * Generate random address
   */
  generateAddress(): Address {
    const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Maple Dr', 'Elm St', 'Park Ave', 'First St'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'];
    
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zipCode = Math.floor(Math.random() * 90000) + 10000;
    
    return {
      street: `${streetNumber} ${street}`,
      city,
      state,
      zipCode: zipCode.toString(),
      country: 'USA',
    };
  }

  /**
   * Generate random date of birth
   */
  generateDateOfBirth(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    return randomDate.toISOString().split('T')[0];
  }

  /**
   * Generate random ID
   */
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate random product data
   */
  generateProductData(): ProductData {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive'];
    const adjectives = ['Premium', 'Deluxe', 'Professional', 'Advanced', 'Standard', 'Basic', 'Ultimate', 'Smart'];
    const nouns = ['Device', 'Tool', 'System', 'Kit', 'Set', 'Collection', 'Bundle', 'Package'];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return {
      id: this.generateId(),
      name: `${adjective} ${noun}`,
      description: `A high-quality ${adjective.toLowerCase()} ${noun.toLowerCase()} for all your needs.`,
      category,
      price: Math.floor(Math.random() * 1000) + 10,
      stock: Math.floor(Math.random() * 100) + 1,
      sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 1000),
    };
  }

  /**
   * Generate random order data
   */
  generateOrderData(): OrderData {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    return {
      id: this.generateId(),
      userId: this.generateId(),
      items: [this.generateProductData(), this.generateProductData()],
      total: Math.floor(Math.random() * 500) + 50,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      orderDate: new Date().toISOString(),
      shippingAddress: this.generateAddress(),
      billingAddress: this.generateAddress(),
    };
  }

  /**
   * Generate random credit card data (test data only)
   */
  generateCreditCardData(): CreditCardData {
    const cardTypes = ['Visa', 'MasterCard', 'American Express', 'Discover'];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    
    let cardNumber = '';
    let cvv = '';
    
    switch (cardType) {
      case 'Visa':
        cardNumber = '4111111111111111';
        cvv = '123';
        break;
      case 'MasterCard':
        cardNumber = '5555555555554444';
        cvv = '123';
        break;
      case 'American Express':
        cardNumber = '378282246310005';
        cvv = '1234';
        break;
      case 'Discover':
        cardNumber = '6011111111111117';
        cvv = '123';
        break;
    }
    
    const expiryMonth = Math.floor(Math.random() * 12) + 1;
    const expiryYear = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
    
    return {
      cardNumber,
      cardType,
      expiryMonth: expiryMonth.toString().padStart(2, '0'),
      expiryYear: expiryYear.toString(),
      cvv,
      holderName: 'Test User',
    };
  }

  /**
   * Generate test data set
   */
  generateTestDataSet(count: number = 5): TestDataSet {
    const users = [];
    const products = [];
    const orders = [];
    
    for (let i = 0; i < count; i++) {
      users.push(this.generateUserData());
      products.push(this.generateProductData());
      orders.push(this.generateOrderData());
    }
    
    return {
      users,
      products,
      orders,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get environment specific test data
   */
  getEnvironmentData(environment: string): EnvironmentData {
    const environments: Record<string, EnvironmentData> = {
      development: {
        baseUrl: 'http://localhost:3000',
        apiUrl: 'http://localhost:8000',
        adminUser: { username: 'admin', password: 'admin123' },
        testUser: { username: 'testuser', password: 'test123' },
      },
      staging: {
        baseUrl: 'https://staging.example.com',
        apiUrl: 'https://api-staging.example.com',
        adminUser: { username: 'admin', password: 'staging_admin_pass' },
        testUser: { username: 'testuser', password: 'staging_test_pass' },
      },
      production: {
        baseUrl: 'https://example.com',
        apiUrl: 'https://api.example.com',
        adminUser: { username: 'admin', password: 'prod_admin_pass' },
        testUser: { username: 'testuser', password: 'prod_test_pass' },
      },
    };
    
    return environments[environment] || environments.development;
  }

  /**
   * Generate bulk test data
   */
  async generateBulkData(type: 'users' | 'products' | 'orders', count: number): Promise<any[]> {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'users':
          data.push(this.generateUserData());
          break;
        case 'products':
          data.push(this.generateProductData());
          break;
        case 'orders':
          data.push(this.generateOrderData());
          break;
      }
    }
    
    return data;
  }

  /**
   * Validate test data
   */
  validateData(data: any, schema: any): boolean {
    try {
      // Simple validation - can be extended with proper schema validation
      if (typeof data !== 'object' || data === null) {
        return false;
      }
      
      for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
          if (!(key in data)) {
            this.logger.warn(`Missing required field: ${key}`);
            return false;
          }
          
          const expectedType = schema[key];
          const actualType = typeof data[key];
          
          if (actualType !== expectedType) {
            this.logger.warn(`Field ${key} should be ${expectedType}, got ${actualType}`);
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Data validation failed: ${error}`);
      return false;
    }
  }
}

// Type definitions
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  address: Address;
  dateOfBirth: string;
  id: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  rating: number;
  reviews: number;
}

export interface OrderData {
  id: string;
  userId: string;
  items: ProductData[];
  total: number;
  status: string;
  orderDate: string;
  shippingAddress: Address;
  billingAddress: Address;
}

export interface CreditCardData {
  cardNumber: string;
  cardType: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}

export interface TestDataSet {
  users: UserData[];
  products: ProductData[];
  orders: OrderData[];
  timestamp: string;
}

export interface EnvironmentData {
  baseUrl: string;
  apiUrl: string;
  adminUser: { username: string; password: string };
  testUser: { username: string; password: string };
}

// Export singleton instance
export const testData = TestData.getInstance();
