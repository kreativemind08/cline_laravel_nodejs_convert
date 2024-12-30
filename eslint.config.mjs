import eslintRecommended from '@eslint/js';

export default [
  {
    ...eslintRecommended.configs.recommended,
    "rules": {
      "semi": ["error", "never"]
    },
    "languageOptions": {
      "parserOptions": {
        "ecmaVersion": 'latest',
        "sourceType": 'script'
      },
      "globals": {
        "node": true,
        "es2021": true,
        "module": "readonly",
        "require": "readonly"
      }
    }
  },
];
