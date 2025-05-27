# Contributing to React Native Simple Charts

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/react-native-simple-charts.git
   cd react-native-simple-charts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the example app**
   ```bash
   cd example
   npm install
   npm start
   ```

4. **Build the library**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
react-native-simple-charts/
├── src/                    # Library source code
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions and types
│   └── index.ts           # Main exports
├── lib/                   # Compiled output (generated)
├── example/               # Example app demonstrating usage
├── __tests__/             # Test files
└── docs/                  # Documentation
```

## 🛠 Development Guidelines

### Code Style

- **TypeScript**: All code must be written in TypeScript
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Code is automatically formatted
- **Naming**: Use descriptive names, prefer full words over abbreviations

### Component Guidelines

- **Functional Components**: Use React hooks, avoid class components
- **Performance**: Optimize for 60fps, use `useMemo` and `useCallback`
- **Props**: Define comprehensive TypeScript interfaces
- **Documentation**: Include JSDoc comments for all public APIs

### Testing

- **Unit Tests**: Write tests for all utility functions
- **Component Tests**: Test React components with React Native Testing Library
- **Performance Tests**: Ensure no regressions in gesture handling performance

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

### Building

```bash
# Clean previous build
npm run clean

# Build library
npm run build

# Type check
npm run type-check

# Development build (watch mode)
npm run dev
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **React Native version**
2. **Library version**
3. **Platform** (iOS/Android)
4. **Minimal reproduction** example
5. **Expected vs actual behavior**
6. **Error messages** or screenshots

## ✨ Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** - why is this feature needed?
3. **Provide examples** of how the API might look
4. **Consider backwards compatibility**

## 🔧 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run type-check
   npm test
   npm run build
   ```

4. **Update documentation**
   - Update README.md if adding new features
   - Add/update JSDoc comments
   - Update example app if relevant

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add dynamic padding for axis labels"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### PR Requirements

- ✅ All tests pass
- ✅ TypeScript compilation succeeds
- ✅ Code follows style guidelines
- ✅ Documentation updated
- ✅ Example app still works
- ✅ No breaking changes (or properly documented)

## 📋 Commit Message Format

We use conventional commits:

```
type(scope): description
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat: add dynamic padding system
fix: resolve gesture handling on Android
docs: update installation instructions
perf: optimize coordinate lookup algorithm
```

## 🏗 Architecture Notes

### Performance Considerations

- **Worklet Safety**: Gesture handling runs on UI thread
- **Memory Management**: Minimize object creation in render loops
- **Coordinate Lookup**: Pre-calculated lookup tables for O(1) access
- **SVG Optimization**: Efficient path generation and rendering

### Key Components

- **Chart**: Main component, orchestrates all functionality
- **AxisRenderer**: Handles axis rendering with dynamic padding
- **LineRenderer**: SVG path generation with smoothing algorithms
- **useCoordinateLookup**: Performance-critical coordinate system
- **useGestureHandling**: Worklet-safe touch interaction

### Adding New Features

1. **Consider Performance**: Will this affect 60fps goal?
2. **TypeScript First**: Define interfaces before implementation
3. **Test Coverage**: Add comprehensive tests
4. **Documentation**: Update README and JSDoc
5. **Example Usage**: Add to example app if user-facing

## 🤝 Community Guidelines

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Patient**: Maintainers review PRs in their spare time
- **Be Helpful**: Help other contributors when possible
- **Stay On Topic**: Keep discussions focused on the project

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Discord**: Join our community Discord (link in README)

## 🎯 Good First Issues

Look for issues labeled `good first issue` or `help wanted`. These are typically:

- Documentation improvements
- Small bug fixes
- Adding new chart styling options
- Writing tests for existing functionality

---

Thank you for contributing to React Native Simple Charts! 🚀