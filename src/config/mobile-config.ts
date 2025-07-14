/**
 * Mobile device configuration for cross-platform testing
 */
export interface MobileDevice {
  name: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  orientation?: 'portrait' | 'landscape';
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Predefined mobile devices for testing
 */
export const mobileDevices: Record<string, MobileDevice> = {
  'iPhone 13': {
    name: 'iPhone 13',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'iPhone 13 Pro Max': {
    name: 'iPhone 13 Pro Max',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 428, height: 926 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'iPhone SE': {
    name: 'iPhone SE',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'Samsung Galaxy S21': {
    name: 'Samsung Galaxy S21',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    viewport: { width: 384, height: 854 },
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'Samsung Galaxy S21 Ultra': {
    name: 'Samsung Galaxy S21 Ultra',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 3.5,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'Google Pixel 6': {
    name: 'Google Pixel 6',
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'iPad Air': {
    name: 'iPad Air',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'iPad Pro': {
    name: 'iPad Pro',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  },
  'Samsung Galaxy Tab S8': {
    name: 'Samsung Galaxy Tab S8',
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X706B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36',
    viewport: { width: 800, height: 1280 },
    deviceScaleFactor: 2.5,
    isMobile: true,
    hasTouch: true,
    orientation: 'portrait'
  }
};

/**
 * Mobile testing configuration
 */
export class MobileConfig {
  private static instance: MobileConfig;
  
  private constructor() {}
  
  public static getInstance(): MobileConfig {
    if (!MobileConfig.instance) {
      MobileConfig.instance = new MobileConfig();
    }
    return MobileConfig.instance;
  }
  
  /**
   * Get device configuration by name
   */
  public getDevice(deviceName: string): MobileDevice | undefined {
    return mobileDevices[deviceName];
  }
  
  /**
   * Get all available devices
   */
  public getAllDevices(): Record<string, MobileDevice> {
    return mobileDevices;
  }
  
  /**
   * Get devices by type
   */
  public getDevicesByType(type: 'phone' | 'tablet'): MobileDevice[] {
    const devices = Object.values(mobileDevices);
    
    if (type === 'phone') {
      return devices.filter(device => 
        device.viewport.width < 500 && 
        device.viewport.height < 1000
      );
    } else {
      return devices.filter(device => 
        device.viewport.width >= 500 || 
        device.viewport.height >= 1000
      );
    }
  }
  
  /**
   * Get devices by platform
   */
  public getDevicesByPlatform(platform: 'ios' | 'android'): MobileDevice[] {
    const devices = Object.values(mobileDevices);
    
    return devices.filter(device => {
      if (platform === 'ios') {
        return device.userAgent.includes('iPhone') || device.userAgent.includes('iPad');
      } else {
        return device.userAgent.includes('Android');
      }
    });
  }
  
  /**
   * Create custom device configuration
   */
  public createCustomDevice(config: Partial<MobileDevice> & { name: string }): MobileDevice {
    const defaultConfig: MobileDevice = {
      name: config.name,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      orientation: 'portrait'
    };
    
    return { ...defaultConfig, ...config };
  }
  
  /**
   * Get landscape orientation for device
   */
  public getLandscapeOrientation(device: MobileDevice): MobileDevice {
    return {
      ...device,
      viewport: {
        width: device.viewport.height,
        height: device.viewport.width
      },
      orientation: 'landscape'
    };
  }
  
  /**
   * Get responsive breakpoints
   */
  public getResponsiveBreakpoints(): { name: string; width: number }[] {
    return [
      { name: 'mobile-small', width: 320 },
      { name: 'mobile-medium', width: 375 },
      { name: 'mobile-large', width: 414 },
      { name: 'tablet-small', width: 768 },
      { name: 'tablet-large', width: 1024 },
      { name: 'desktop-small', width: 1200 },
      { name: 'desktop-large', width: 1920 }
    ];
  }
}

export const mobileConfig = MobileConfig.getInstance();