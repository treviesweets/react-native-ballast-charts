/**
 * Jest Configuration for React Native Simple Charts Library
 * Optimized for React Native library testing with proper mocking
 */

module.exports = {
  preset: 'react-native',
  
  // Test environment
  testEnvironment: 'node',
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/example/',
  ],
  
  // Coverage configuration
  collectCoverage: false, // Disable for initial setup
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // Module name mapping for React Native dependencies
  moduleNameMapper: {
    '^react-native$': 'react-native',
    '^react-native-svg$': '<rootDir>/__tests__/mocks/react-native-svg.ts',
    '^react-native-reanimated$': '<rootDir>/__tests__/mocks/react-native-reanimated.ts',
    '^react-native-gesture-handler$': '<rootDir>/__tests__/mocks/react-native-gesture-handler.ts',
  },
  
  // Transform ignore patterns - don't transform these node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-native-svg|react-native-reanimated|react-native-gesture-handler)',
  ],
  
  // Clear mocks automatically between tests
  clearMocks: true,
  
  // Verbose output for better debugging
  verbose: true,
  
  // Timeout for tests (30 seconds)
  testTimeout: 30000,
};