module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
    'jsx-a11y',
    '@typescript-eslint',
  ],
  'rules': {
    'comma-dangle': [ 'error', 'always-multiline' ],
    'arrow-parens': [ 'warn', 'always' ],
    'brace-style': [ 'warn', 'stroustrup', { 'allowSingleLine': true }],
    'class-methods-use-this': [ 'warn' ],
    'indent': [ 'error', 2, { 'SwitchCase': 1 }],
    'linebreak-style': [ 'error', 'unix' ],
    'max-len': [ 'off' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'never' ],
    'no-console': [ 'warn' ],
    'no-underscore-dangle': [ 'error', { 'allow': [ '_id', '_sound', '_album', '_user' ]}],
    'array-bracket-spacing': [ 'error', 'always', {
      'objectsInArrays': false,
      'arraysInArrays': false,
    }],
    'object-curly-spacing': [ 'error', 'always', {
      'objectsInObjects': false,
      'arraysInObjects': false,
    }],
    // 'react/jsx-filename-extension': [ 1, { 'extensions': [ '.js', '.jsx' ] } ],
    'react/no-unused-state': [ 'warn' ],
    'react/jsx-max-props-per-line': [ 'error', { 'when': 'multiline' }],
    'react/react-in-jsx-scope': [ 'off' ],
    'react/jsx-indent-props': [ 2, 2 ],
    'react/jsx-closing-bracket-location': [ 1, 'tag-aligned' ],
    'jsx-a11y/anchor-is-valid': [ 'off' ],
    'no-unused-vars': [ 'warn' ],
    'react/jsx-props-no-spreading': [ 'off' ],
    'react/jsx-curly-newline': [ 'off' ],
    'react/jsx-one-expression-per-line': 'off',
    'react/destructuring-assignment': [ 'warn' ],
    'react/self-closing-comp': [ 'error' ],
  },
  'overrides': [
    {
      // enable the rule specifically for TypeScript files
      'files': [ '*.tsx' ],
      'rules': {
        '@typescript-eslint/explicit-module-boundary-types': [ 'off' ],
        '@typescript-eslint/no-explicit-any': [ 'off' ],
      },
    },
  ],
}
