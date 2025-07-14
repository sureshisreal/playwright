import { test } from '../../src/fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('Quick API Test API Tests', () => {
  test('should GET /api/users', async ({ apiClient, allureHelper }) => {
    await allureHelper.addDescription('Quick API Test API endpoint test');
    await allureHelper.addTags(['api', 'GET']);

    await allureHelper.addStep('Send GET request', async () => {
      const response = await apiClient.get('/api/users');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeDefined();
    });
  });
});