module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'eslint:recommended',
        'airbnb-base',
        'plugin:vue/essential',
        'plugin:@typescript-eslint/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        '@typescript-eslint/parser': ['.ts', '.tsx'],
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: './',
        extraFileExtensions: ['.vue'],
    },
    plugins: [
        'vue',
        '@typescript-eslint',
        'editorconfig',
    ],
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
    rules: {
        'max-len': [1, 260, 2],
    },
};
