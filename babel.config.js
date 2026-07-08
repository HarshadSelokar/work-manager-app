module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@constants': './src/constants',
          '@services': './src/services',
          '@store': './src/store',
          '@utils': './src/utils',
          '@types': './src/types',
          '@assets': './src/assets',
          '@theme': './src/theme',
          '@models': './src/models',
        },
      },
    ],
    'react-native-worklets/plugin',
    'react-native-reanimated/plugin',
  ],
};