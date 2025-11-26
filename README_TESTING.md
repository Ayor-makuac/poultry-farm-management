# Quick Testing Guide

## Quick Start

### Backend Testing

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Set up test database** (create a separate test database/collection namespace in MongoDB)

3. **Run tests**:
```bash
npm test
```

### Frontend Testing

1. **Run tests** (already has dependencies):
```bash
cd frontend
npm test
```

## Test Files Created

### Backend Tests
- `backend/tests/__tests__/auth.test.js` - Authentication tests
- `backend/tests/__tests__/users.test.js` - User management tests

### Frontend Tests
- `frontend/src/components/common/__tests__/Button.test.js` - Button component tests
- `frontend/src/components/common/__tests__/Input.test.js` - Input component tests
- `frontend/src/pages/__tests__/Login.test.js` - Login page tests
- `frontend/src/utils/__tests__/permissions.test.js` - Permission utility tests

## Configuration Files

- `backend/jest.config.js` - Jest configuration
- `backend/tests/setup.js` - Test setup file
- `frontend/src/setupTests.js` - Frontend test setup (already exists)

## Full Documentation

See `TESTING_GUIDE.md` for comprehensive testing documentation.

