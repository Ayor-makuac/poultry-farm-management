# Testing Guide - Poultry Farm Management System

This guide provides comprehensive instructions for testing both the backend API and frontend React application.

## Table of Contents

1. [Overview](#overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The project uses:
- **Backend**: Jest + Supertest for API testing
- **Frontend**: Jest + React Testing Library for component testing

---

## Backend Testing

### Setup

1. **Install Dependencies** (if not already installed):
```bash
cd backend
npm install
```

2. **Configure Test Database**:
   - Create a separate test database in MySQL
   - Update `.env` file with test database credentials:
   ```
   DB_NAME=poultry_farm_test
   DB_USER=your_test_user
   DB_PASSWORD=your_test_password
   ```

3. **Test Configuration**:
   - Test configuration is in `backend/jest.config.js`
   - Setup file: `backend/tests/setup.js`

### Test Structure

```
backend/
├── tests/
│   ├── setup.js              # Test setup and configuration
│   └── __tests__/
│       ├── auth.test.js      # Authentication tests
│       ├── users.test.js     # User management tests
│       └── ...               # Other controller tests
```

### Writing Backend Tests

#### Example: Testing Authentication Endpoints

```javascript
const request = require('supertest');
const app = require('../../server');
const { User } = require('../../models');

describe('Auth API Tests', () => {
  let testUser;

  beforeAll(async () => {
    // Setup: Clean up test data
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    if (testUser) {
      await User.destroy({ where: { user_id: testUser.user_id } });
    }
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Worker'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

### Test Categories

1. **Authentication Tests** (`auth.test.js`):
   - User registration
   - User login
   - Token validation
   - Protected routes

2. **User Management Tests** (`users.test.js`):
   - Get all users (Admin only)
   - Get single user
   - Update user
   - Delete user
   - Role-based access control

3. **CRUD Operation Tests**:
   - Create operations
   - Read operations
   - Update operations
   - Delete operations
   - Validation tests

### Running Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.js

# Run tests with coverage
npm test -- --coverage

# Run tests for specific pattern
npm run test:auth
npm run test:users
```

---

## Frontend Testing

### Setup

1. **Dependencies** (already included in package.json):
   - `@testing-library/react`
   - `@testing-library/jest-dom`
   - `@testing-library/user-event`

2. **Test Configuration**:
   - Setup file: `frontend/src/setupTests.js`
   - Jest is configured via `react-scripts`

### Test Structure

```
frontend/src/
├── setupTests.js                    # Test setup
├── components/
│   └── common/
│       └── __tests__/
│           ├── Button.test.js      # Button component tests
│           └── Input.test.js       # Input component tests
├── pages/
│   └── __tests__/
│       └── Login.test.js           # Login page tests
└── utils/
    └── __tests__/
        └── permissions.test.js      # Permission utility tests
```

### Writing Frontend Tests

#### Example: Testing a Component

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Example: Testing a Page with Context

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
  });
});
```

### Test Categories

1. **Component Tests**:
   - Rendering
   - User interactions
   - Props handling
   - State changes

2. **Page Tests**:
   - Form submissions
   - Navigation
   - Data fetching
   - Error handling

3. **Utility Tests**:
   - Permission functions
   - Helper functions
   - Data transformations

### Running Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests in watch mode (default)
npm test

# Run tests once
CI=true npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- Login.test.js
```

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test suite
npm test -- auth.test.js

# Run tests matching pattern
npm run test:auth
```

### Frontend Tests

```bash
cd frontend

# Run all tests (watch mode)
npm test

# Run once (CI mode)
CI=true npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- Button.test.js
```

### Running All Tests

```bash
# From project root
# Backend
cd backend && npm test && cd ..

# Frontend
cd frontend && npm test && cd ..
```

---

## Test Coverage

### Backend Coverage

The backend uses Jest's coverage feature. Target thresholds are set in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Viewing Coverage Reports

```bash
# Backend
cd backend
npm test -- --coverage
# Open coverage/lcov-report/index.html in browser

# Frontend
cd frontend
npm test -- --coverage
# Coverage report will be displayed in terminal
```

---

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### 2. Test Data Management

- Use `beforeAll` and `afterAll` for setup/cleanup
- Create test-specific data
- Clean up after tests to avoid conflicts

### 3. Mocking

**Backend:**
```javascript
// Mock database operations if needed
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));
```

**Frontend:**
```javascript
// Mock API calls
jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn()
  }
}));
```

### 4. Async Testing

```javascript
// Use async/await
it('should handle async operations', async () => {
  const response = await request(app)
    .get('/api/users');
  
  expect(response.status).toBe(200);
});

// Use waitFor for React updates
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 5. Testing User Interactions

```javascript
import userEvent from '@testing-library/user-event';

it('handles user input', async () => {
  render(<Input name="email" />);
  const input = screen.getByRole('textbox');
  
  await userEvent.type(input, 'test@example.com');
  expect(input).toHaveValue('test@example.com');
});
```

### 6. Testing Protected Routes

```javascript
// Backend: Include auth token
const response = await request(app)
  .get('/api/users')
  .set('Authorization', `Bearer ${token}`);

// Frontend: Mock authentication context
const mockUser = { role: 'Admin' };
jest.spyOn(useAuth, 'useAuth').mockReturnValue({ user: mockUser });
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem**: Tests fail with database connection errors

**Solution**:
- Ensure test database exists
- Check `.env` file has correct test database credentials
- Verify database server is running

#### 2. Port Already in Use

**Problem**: `EADDRINUSE: address already in use`

**Solution**:
- Change test port in `tests/setup.js`
- Kill process using the port: `lsof -ti:5001 | xargs kill`

#### 3. Module Not Found

**Problem**: `Cannot find module`

**Solution**:
- Run `npm install` in the respective directory
- Check import paths are correct
- Verify file extensions (.js, .jsx)

#### 4. Async Test Timeouts

**Problem**: Tests timeout

**Solution**:
- Increase timeout: `jest.setTimeout(30000)`
- Use `waitFor` for async operations
- Ensure async/await is used correctly

#### 5. Mock Not Working

**Problem**: Mock functions not being called

**Solution**:
- Ensure mocks are defined before imports
- Use `jest.mock()` at the top level
- Clear mocks between tests: `jest.clearAllMocks()`

### Debugging Tips

1. **Use `console.log`** in tests (will be shown in test output)
2. **Run single test**: `npm test -- -t "test name"`
3. **Use `screen.debug()`** to see current DOM state
4. **Check test output** for detailed error messages

---

## Test Examples

### Backend: Testing CRUD Operations

```javascript
describe('Flock Controller', () => {
  let authToken;
  let testFlock;

  beforeAll(async () => {
    // Setup: Login and get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    authToken = loginRes.body.data.token;
  });

  it('should create a new flock', async () => {
    const response = await request(app)
      .post('/api/flocks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        breed: 'Broiler',
        quantity: 100,
        housing_unit: 'Unit A'
      });

    expect(response.status).toBe(201);
    expect(response.body.data.breed).toBe('Broiler');
    testFlock = response.body.data;
  });

  it('should get all flocks', async () => {
    const response = await request(app)
      .get('/api/flocks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Frontend: Testing Forms

```javascript
describe('Register Form', () => {
  it('validates required fields', async () => {
    renderWithProviders(<Register />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    await userEvent.click(submitButton);
    
    // Check validation errors
    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });

  it('validates password match', async () => {
    renderWithProviders(<Register />);
    
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    await userEvent.click(submitButton);
    
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install && CI=true npm test
```

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Summary

- **Backend**: Use Jest + Supertest for API endpoint testing
- **Frontend**: Use Jest + React Testing Library for component testing
- **Coverage**: Aim for 70%+ coverage on critical paths
- **Best Practice**: Write tests before fixing bugs (TDD approach)
- **Maintenance**: Keep tests updated as code changes

Happy Testing! 🧪

