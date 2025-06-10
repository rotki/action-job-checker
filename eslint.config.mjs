import { rotki } from '@rotki/eslint-config';
import github from 'eslint-plugin-github';

export default rotki({
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  stylistic: true,
  formatters: true,
}, {
  files: ['src/**/*.ts'],
  plugins: {
    github,
  },
  rules: {
    'github/array-foreach': 'error',
    'github/no-implicit-buggy-globals': 'error',
    'github/no-then': 'error',
    'github/no-dynamic-script-tag': 'error',
  },
}, {
  files: ['**/*.ts'],
  rules: {
    'perfectionist/sort-objects': 'error',
  },
});
