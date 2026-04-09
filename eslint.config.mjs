import rotki from '@rotki/eslint-config';

export default rotki({
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  stylistic: true,
  formatters: true,
}, {
  files: ['**/*.ts'],
  rules: {
    'perfectionist/sort-objects': 'error',
  },
}, {
  files: ['**/*.yml'],
  rules: {
    '@stylistic/spaced-comment': 'off',
  },
});
