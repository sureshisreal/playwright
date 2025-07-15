import { test } from '../../src/fixtures/test-fixtures';
import { TestHelpers } from '../../src/utils/test-helpers';
import { CommonFlows } from '../../src/utils/common-flows';

test.describe('Simplified API Tests', () => {
  
  test('get users endpoint', async ({ apiClient, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test users API endpoint',
      tags: ['api', 'users'],
      severity: 'critical'
    })(allureHelper);

    await TestHelpers.testAPI(apiClient, {
      method: 'GET',
      endpoint: '/users',
      expectedStatus: 200,
      validate: (response) => {
        if (!Array.isArray(response.data)) {
          throw new Error('Response should be an array');
        }
      }
    });
  });

  test('create user', async ({ apiClient, allureHelper, testData }) => {
    await TestHelpers.setup({
      description: 'Test user creation',
      tags: ['api', 'users', 'create'],
      severity: 'critical'
    })(allureHelper);

    const userData = testData.generateUserData();
    
    const response = await TestHelpers.testAPI(apiClient, {
      method: 'POST',
      endpoint: '/users',
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      },
      expectedStatus: 201,
      validate: (response) => {
        if (!response.data.id) {
          throw new Error('Created user should have an ID');
        }
      }
    });

    allureHelper.addParameter('Created User ID', response.data.id);
  });

  test('authenticated request', async ({ apiClient, allureHelper }) => {
    await TestHelpers.setup({
      description: 'Test authenticated API request',
      tags: ['api', 'auth'],
      severity: 'critical'
    })(allureHelper);

    await CommonFlows.authenticateAPI(apiClient, {
      username: 'testuser',
      password: 'testpass'
    });

    await TestHelpers.testAPI(apiClient, {
      method: 'GET',
      endpoint: '/protected',
      expectedStatus: 200
    });
  });
});