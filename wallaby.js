/* eslint-disable */

module.exports = function (w) {
    return {
        files: [
            'src/**/*.ts',
            'src/**/*.vue',
            'tests/**/*.sqlplan',
            'package.json',
            'tsconfig.json',
            "jest.config.js",
        ],

        tests: [
            'tests/**/*.spec.ts',
        ],

        compilers: {
            '**/*.ts': w.compilers.typeScript({
                module: 'commonjs', // it is set to 'esnext' in tsconfig.json for dynamic components
            }),
        },

        env: {
            type: 'node',
            runner: 'node',
        },

        preprocessors: {
            '**/*.vue': file => require('vue-jest').process(file.content, file.path),
            '**/*.js?(x)': file => require('@babel/core').transform(
                file.content,
                {sourceMap: true, compact: false, filename: file.path, plugins: ['babel-plugin-jest-hoist']})
          },

        testFramework: 'jest',

        setup: () => {
            const jestConfig = require('./package').jest || require('./jest.config');
            jestConfig.transform = {};
            wallaby.testFramework.configure(jestConfig);

            const Vue = require('vue');
            Vue.config.productionTip = false;
        },

        debug: false,
    };
};
