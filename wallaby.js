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

        testFramework: 'jest',
        debug: false,
    };
};
