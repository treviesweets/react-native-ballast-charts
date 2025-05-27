# Testing Guide for React Native Simple Charts

This document provides comprehensive information about the testing framework implemented for the React Native Simple Charts library.

## 🧪 Testing Overview

The library includes a comprehensive testing suite with:
- **Unit tests** for utility functions and hooks
- **Component tests** for Chart and sub-components  
- **Integration tests** for complex interactions
- **Snapshot tests** for regression detection
- **Error handling tests** for edge cases

## 📁 Test Structure

```
__tests__/
├── setup.ts                    # Global test configuration
├── mocks/                      # React Native mocks
│   ├── react-native-svg.ts
│   ├── react-native-reanimated.ts
│   └── react-native-gesture-handler.ts
├── components/                 # Component tests
│   ├── Chart.test.tsx         # Basic Chart component tests
│   ├── Chart.snapshots.test.tsx # Snapshot tests
│   ├── Chart.errors.test.tsx  # Error handling tests
│   └── Chart.integration.test.tsx # Integration tests
├── hooks/                      # Hook tests
│   ├── useChartDimensions.test.ts
│   └── useCoordinateLookup.test.ts
└── utils/                      # Utility tests
    ├── validation.test.ts
    └── pathGeneration.test.ts
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci
```

### Focused Testing

```bash
# Run specific test file
npm test Chart.test.tsx

# Run tests matching pattern
npm test --testNamePattern="validation"

# Run tests for specific component
npm test components/

# Update snapshots
npm test -- --updateSnapshot
```

## 🎯 Test Categories

### 1. Unit Tests
- **Validation utilities** (`validation.test.ts`)
- **Path generation** (`pathGeneration.test.ts`)
- **Chart dimensions hook** (`useChartDimensions.test.ts`)
- **Coordinate lookup hook** (`useCoordinateLookup.test.ts`)

### 2. Component Tests
- **Basic rendering** (`Chart.test.tsx`)
- **Props handling and validation**
- **Event handling and interactions**
- **Styling and theming**

### 3. Integration Tests
- **Component lifecycle** (`Chart.integration.test.tsx`)
- **Complex prop combinations**
- **Real-world usage scenarios**
- **Performance with large datasets**

### 4. Snapshot Tests
- **Component rendering consistency** (`Chart.snapshots.test.tsx`)
- **Different prop combinations**
- **Regression detection**

### 5. Error Handling Tests
- **Invalid data handling** (`Chart.errors.test.tsx`)
- **Boundary conditions**
- **Graceful degradation**
- **Recovery scenarios**

## 🛠️ Test Utilities

### Mock Data Generators

```typescript
import { createMockChartData, createMockStockData } from '../setup';

// Generate simple chart data
const data = createMockChartData(10); // 10 data points

// Generate stock-like data with timestamps
const stockData = createMockStockData(50); // 50 data points
```

### Test Helpers

```typescript
import { mockChartProps, mockStockChartProps } from '../setup';

// Basic chart props for testing
render(<Chart {...mockChartProps} />);

// Stock chart props with interaction
render(<Chart {...mockStockChartProps} />);
```

## 📊 Coverage Goals

The testing framework aims for:
- **Lines**: 70%+ coverage
- **Functions**: 70%+ coverage  
- **Branches**: 70%+ coverage
- **Statements**: 70%+ coverage

### Critical Path Coverage
- Chart component rendering: 90%+
- Data validation: 95%+
- Coordinate calculations: 85%+
- Error handling: 80%+

## 🔧 Configuration

### Jest Configuration
The library uses a custom Jest configuration (`jest.config.js`) optimized for React Native library testing:

- **Preset**: `react-native`
- **Transform**: TypeScript with `ts-jest`
- **Module mapping**: React Native dependencies
- **Coverage**: HTML and LCOV reports
- **Setup**: Global mocks and utilities

### Mocking Strategy
- **react-native-svg**: Mock SVG components as div elements
- **react-native-reanimated**: Mock animations and worklets
- **react-native-gesture-handler**: Mock gesture detection
- **React Native APIs**: Mock Dimensions, Platform, etc.

## 🐛 Testing Best Practices

### Writing Tests
1. **Descriptive names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Single responsibility**: One assertion per test when practical
4. **Edge cases**: Test boundary conditions and error states
5. **Performance**: Test with realistic data sizes

### Mock Management
1. **Consistent mocks**: Use the same mocks across tests
2. **Reset state**: Clear mocks between tests
3. **Realistic behavior**: Make mocks behave like real components
4. **Type safety**: Maintain TypeScript types in mocks

### Snapshot Testing
1. **Meaningful snapshots**: Only snapshot stable, meaningful output
2. **Regular updates**: Review and update snapshots during development
3. **Small snapshots**: Keep snapshots focused and readable
4. **Version control**: Commit snapshot changes with code changes

## 🚨 Common Issues

### Test Failures
1. **Module resolution**: Ensure all React Native modules are properly mocked
2. **Async operations**: Use proper async/await patterns
3. **State updates**: Allow for React state updates with act()
4. **Memory leaks**: Clean up resources in test teardown

### Performance Issues
1. **Large datasets**: Use smaller test datasets when possible
2. **Frequent re-renders**: Mock expensive operations
3. **Timeout issues**: Increase Jest timeout for complex tests
4. **Parallel execution**: Ensure tests don't conflict when run in parallel

## 📈 Continuous Integration

The test suite is designed to run in CI/CD environments:

```yaml
# Example GitHub Actions step
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## 🔍 Debugging Tests

### Local Debugging
```bash
# Run specific test with verbose output
npm test -- --verbose Chart.test.tsx

# Debug test in watch mode
npm run test:watch -- --testNamePattern="specific test"

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Test Output
- **Console logs**: Use `console.log` for debugging (cleaned up automatically)
- **Error messages**: Include helpful context in test assertions
- **Coverage reports**: Check `coverage/` directory for detailed reports

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing React Native Components](https://reactnative.dev/docs/testing-overview)

---

For questions or issues with the testing setup, please check the test files for examples or open an issue in the repository.
