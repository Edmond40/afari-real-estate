module.exports = {
  env: {
    node: true,
    es2021: true,
    browser: false,
    commonjs: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  plugins: ['node'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'node/no-unpublished-import': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-import': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.mjs', '.ts', '.tsx']
    }
  }
};
