module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    '@babel/preset-react',
    '@babel/preset-flow', // Add Flow preset for RN internals
  ],
  plugins: [
    'react-native-reanimated/plugin', // Must be last
  ],
};
