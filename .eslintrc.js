module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'plugin:vue/recommended',
        '@vue/airbnb',
        '@vue/typescript',
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
        // project: './tsconfig.json', // this has a big time perf hit right now
        tsconfigRootDir: './',
        extraFileExtensions: ['.vue'],
    },
    plugins: [
        'vue',
        '@typescript-eslint',
    ],
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
    rules: {
        'class-methods-use-this': 0,
        'max-len': [1, 260, 2],
        'linebreak-style': 0,
        indent: ['error', 4, {
            SwitchCase: 1,
        }],
        'vue/script-indent': ['error', 4, {
            switchCase: 1,
        }],
        'vue/html-indent': ['error', 4],
    },
};
