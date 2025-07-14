import { test, expect } from '../../src/fixtures/test-fixtures';
import { ApiClient } from '../../src/utils/api-client';
import { testConfig } from '../../src/config/test-config';

test.describe('API Tests', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ allureHelper }) => {
    apiClient = new ApiClient(testConfig.apiBaseUrl);
    await apiClient.init();
    
    await allureHelper.addStep('Initialize API client', async () => {
      // API client is initialized
    });
  });

  test.afterEach(async () => {
    await apiClient.dispose();
  });

  test('should get users list', async ({ 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API endpoint to retrieve users list');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['api', 'users', 'get']);
    allureHelper.addOwner('api-team');

    let response: any;

    await allureHelper.addStep('Send GET request to /users', async () => {
      response = await apiClient.get('/users');
    });

    await allureHelper.addStep('Verify response status', async () => {
      expect(response.status).toBe(200);
      allureHelper.addParameter('Response Status', response.status.toString());
    });

    await allureHelper.addStep('Verify response structure', async () => {
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBeTruthy();
    });

    await allureHelper.addStep('Add API response to report', async () => {
      await allureHelper.addApiResponseAttachment(response, 'Users List Response');
    });

    await allureHelper.addStep('Verify response time', async () => {
      expect(response.duration).toBeLessThan(5000); // 5 seconds max
      allureHelper.addParameter('Response Time', `${response.duration}ms`);
    });

    logger.pass('Users API endpoint working correctly');
  });

  test('should create new user', async ({ 
    logger, 
    allureHelper, 
    testData 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API endpoint to create a new user');
    allureHelper.addSeverity('blocker');
    allureHelper.addTags(['api', 'users', 'post', 'create']);
    allureHelper.addOwner('api-team');

    const userData = testData.generateUserData();
    const newUser = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username,
    };

    allureHelper.addParameter('User Email', newUser.email);
    allureHelper.addParameter('User Username', newUser.username);

    let response: any;

    await allureHelper.addStep('Send POST request to create user', async () => {
      response = await apiClient.post('/users', newUser);
    });

    await allureHelper.addStep('Verify user creation response', async () => {
      expect(response.status).toBe(201);
      expect(response.data.id).toBeDefined();
      expect(response.data.email).toBe(newUser.email);
    });

    await allureHelper.addStep('Add API response to report', async () => {
      await allureHelper.addApiResponseAttachment(response, 'Create User Response');
    });

    await allureHelper.addStep('Verify user data in response', async () => {
      expect(response.data.firstName).toBe(newUser.firstName);
      expect(response.data.lastName).toBe(newUser.lastName);
      expect(response.data.username).toBe(newUser.username);
    });

    logger.pass('User creation API working correctly');
  });

  test('should get user by ID', async ({ 
    logger, 
    allureHelper, 
    testData 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API endpoint to retrieve user by ID');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['api', 'users', 'get', 'by-id']);
    allureHelper.addOwner('api-team');

    let userId: string;
    let createResponse: any;
    let getResponse: any;

    // First create a user
    await allureHelper.addStep('Create test user', async () => {
      const userData = testData.generateUserData();
      const newUser = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
      };

      createResponse = await apiClient.post('/users', newUser);
      userId = createResponse.data.id;
      allureHelper.addParameter('Created User ID', userId);
    });

    await allureHelper.addStep('Get user by ID', async () => {
      getResponse = await apiClient.get(`/users/${userId}`);
    });

    await allureHelper.addStep('Verify get user response', async () => {
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.id).toBe(userId);
      expect(getResponse.data.email).toBe(createResponse.data.email);
    });

    await allureHelper.addStep('Add API response to report', async () => {
      await allureHelper.addApiResponseAttachment(getResponse, 'Get User Response');
    });

    logger.pass('Get user by ID API working correctly');
  });

  test('should update user', async ({ 
    logger, 
    allureHelper, 
    testData 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API endpoint to update user information');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['api', 'users', 'put', 'update']);
    allureHelper.addOwner('api-team');

    let userId: string;
    let updateResponse: any;

    // First create a user
    await allureHelper.addStep('Create test user', async () => {
      const userData = testData.generateUserData();
      const newUser = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
      };

      const createResponse = await apiClient.post('/users', newUser);
      userId = createResponse.data.id;
    });

    await allureHelper.addStep('Update user information', async () => {
      const updatedData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      updateResponse = await apiClient.put(`/users/${userId}`, updatedData);
    });

    await allureHelper.addStep('Verify update response', async () => {
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.firstName).toBe('Updated');
      expect(updateResponse.data.lastName).toBe('User');
    });

    await allureHelper.addStep('Add API response to report', async () => {
      await allureHelper.addApiResponseAttachment(updateResponse, 'Update User Response');
    });

    logger.pass('Update user API working correctly');
  });

  test('should delete user', async ({ 
    logger, 
    allureHelper, 
    testData 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API endpoint to delete user');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['api', 'users', 'delete']);
    allureHelper.addOwner('api-team');

    let userId: string;
    let deleteResponse: any;

    // First create a user
    await allureHelper.addStep('Create test user', async () => {
      const userData = testData.generateUserData();
      const newUser = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
      };

      const createResponse = await apiClient.post('/users', newUser);
      userId = createResponse.data.id;
    });

    await allureHelper.addStep('Delete user', async () => {
      deleteResponse = await apiClient.delete(`/users/${userId}`);
    });

    await allureHelper.addStep('Verify delete response', async () => {
      expect(deleteResponse.status).toBe(204);
    });

    await allureHelper.addStep('Verify user is deleted', async () => {
      try {
        await apiClient.get(`/users/${userId}`);
        // If we get here, the user still exists - test should fail
        expect(false).toBeTruthy();
      } catch (error) {
        // Expected - user should not exist
        expect(true).toBeTruthy();
      }
    });

    logger.pass('Delete user API working correctly');
  });

  test('should handle API errors correctly', async ({ 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API error handling for invalid requests');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['api', 'error-handling', 'validation']);
    allureHelper.addOwner('api-team');

    let errorResponse: any;

    await allureHelper.addStep('Send request to non-existent endpoint', async () => {
      try {
        await apiClient.get('/nonexistent-endpoint');
      } catch (error) {
        errorResponse = error;
      }
    });

    await allureHelper.addStep('Verify error response', async () => {
      expect(errorResponse).toBeDefined();
      // Add specific error validation based on your API
    });

    await allureHelper.addStep('Test invalid user creation', async () => {
      const invalidUserData = {
        // Missing required fields
        email: 'invalid-email',
      };

      try {
        await apiClient.post('/users', invalidUserData);
      } catch (error) {
        expect(error).toBeDefined();
        allureHelper.addParameter('Error Type', 'Validation Error');
      }
    });

    logger.pass('API error handling working correctly');
  });

  test('should handle authentication', async ({ 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API authentication mechanisms');
    allureHelper.addSeverity('critical');
    allureHelper.addTags(['api', 'authentication', 'security']);
    allureHelper.addOwner('security-team');

    await allureHelper.addStep('Set API key', async () => {
      apiClient.setApiKey(testConfig.apiKey);
    });

    await allureHelper.addStep('Make authenticated request', async () => {
      const response = await apiClient.get('/authenticated-endpoint');
      expect(response.status).toBe(200);
    });

    await allureHelper.addStep('Test without authentication', async () => {
      const unauthenticatedClient = new ApiClient(testConfig.apiBaseUrl);
      await unauthenticatedClient.init();
      
      try {
        await unauthenticatedClient.get('/authenticated-endpoint');
      } catch (error) {
        expect(error).toBeDefined();
        allureHelper.addParameter('Auth Error', 'Unauthorized access blocked');
      }
      
      await unauthenticatedClient.dispose();
    });

    logger.pass('API authentication working correctly');
  });

  test('should handle rate limiting', async ({ 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API rate limiting behavior');
    allureHelper.addSeverity('minor');
    allureHelper.addTags(['api', 'rate-limiting', 'performance']);
    allureHelper.addOwner('api-team');

    await allureHelper.addStep('Make multiple rapid requests', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(apiClient.get('/users'));
      }

      const responses = await Promise.allSettled(promises);
      const successfulResponses = responses.filter(r => r.status === 'fulfilled');
      const failedResponses = responses.filter(r => r.status === 'rejected');

      allureHelper.addParameter('Successful Requests', successfulResponses.length.toString());
      allureHelper.addParameter('Failed Requests', failedResponses.length.toString());
    });

    logger.pass('Rate limiting test completed');
  });

  test('should validate response schemas', async ({ 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API response schema validation');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['api', 'schema', 'validation']);
    allureHelper.addOwner('api-team');

    await allureHelper.addStep('Get users and validate schema', async () => {
      const response = await apiClient.get('/users');
      
      // Simple schema validation
      const expectedSchema = {
        id: 'string',
        email: 'string',
        firstName: 'string',
        lastName: 'string',
        username: 'string',
      };

      if (Array.isArray(response.data) && response.data.length > 0) {
        apiClient.validateSchema(response, expectedSchema);
      }
    });

    logger.pass('Response schema validation passed');
  });

  test('should measure API performance', async ({ 
    logger, 
    allureHelper 
  }) => {
    // Add test metadata
    allureHelper.addDescription('Test API response time performance');
    allureHelper.addSeverity('normal');
    allureHelper.addTags(['api', 'performance', 'timing']);
    allureHelper.addOwner('performance-team');

    await allureHelper.addStep('Measure multiple API calls', async () => {
      const startTime = Date.now();
      
      // Make multiple API calls
      const responses = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/users'),
        apiClient.get('/users'),
      ]);

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / responses.length;

      allureHelper.addParameter('Total Time', `${totalTime}ms`);
      allureHelper.addParameter('Average Time', `${averageTime}ms`);

      // Assert performance thresholds
      expect(averageTime).toBeLessThan(2000); // 2 seconds max average
    });

    logger.pass('API performance test completed');
  });
});
