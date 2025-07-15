# 🚀 Quick Test Authoring Guide

## Write Tests in Seconds, Not Minutes

### 1. Simple UI Test (3 lines)
```typescript
test('login works', async ({ page, allureHelper }) => {
  await TestHelpers.setup({ description: 'Test login', tags: ['ui', 'auth'] })(allureHelper);
  await CommonFlows.login(page, 'user', 'pass');
});
```

### 2. Simple API Test (3 lines)
```typescript
test('get users', async ({ apiClient, allureHelper }) => {
  await TestHelpers.setup({ description: 'Get users', tags: ['api'] })(allureHelper);
  await TestHelpers.testAPI(apiClient, { method: 'GET', endpoint: '/users', expectedStatus: 200 });
});
```

### 3. Simple Mobile Test (3 lines)
```typescript
test('mobile tap', async ({ page, mobileHelper, allureHelper }) => {
  await TestHelpers.setup({ description: 'Mobile test', tags: ['mobile'] })(allureHelper);
  await TestHelpers.testMobile(mobileHelper, page, { device: 'iPhone 13', url: 'https://example.com' });
});
```

## Reusable Components

### Common Flows (Pre-built)
- `CommonFlows.login(page, username, password)`
- `CommonFlows.search(page, searchTerm)`
- `CommonFlows.addToCart(page, productIndex)`
- `CommonFlows.authenticateAPI(apiClient, credentials)`
- `CommonFlows.setupMobile(mobileHelper, deviceName)`
- `CommonFlows.runA11yScan(accessibilityHelper)`
- `CommonFlows.monitorPerformance(performanceHelper, page, url)`

### Test Helpers (One-liners)
- `TestHelpers.setup({ description, tags, severity })` - Quick test setup
- `TestHelpers.verifyPage(page, { title, url, elements })` - Page verification
- `TestHelpers.testAPI(apiClient, { method, endpoint, expectedStatus })` - API testing
- `TestHelpers.testMobile(mobileHelper, page, { device, url, interactions })` - Mobile testing

### Test Builder (Fluent API)
```typescript
await TestBuilder
  .create('My Test')
  .describe('Test description')
  .tag('ui', 'smoke')
  .step('Navigate', TestActions.navigate(page, '/'))
  .step('Click button', TestActions.click(page, 'button'))
  .execute({ allureHelper });
```

## Time Savings
- **Before**: 50+ lines per test
- **After**: 3-5 lines per test
- **Reduction**: 90% less code
- **Speed**: 10x faster test creation