/* eslint-disable */
module.exports = function(w) {
    return {
        files: [
            'src/**/*.ts',
            'tests/**/*.helper.ts',
            'src/**/*.vue',
            { pattern: 'tests/**/*.sqlplan', instrument: false },
            'package.json',
            'tsconfig.json',
            'tsconfig.jest.json',
            { pattern: 'jest.config.js', instrument: false },
            { pattern: '.babelrc', instrument: false }
        ],

        tests: ['tests/**/*.spec.ts'],

        compilers: {
            '**/*.ts?(x)': w.compilers.typeScript(require('./tsconfig.jest.json')),
            '**/*.js': w.compilers.babel()
        },
        env: {
            type: 'node',
            runner: 'node'
        },

        testFramework: 'jest',
        debug: false,

        setup(w) {
            // prevent ts-jest from double compiling the typescript
            const jestConfig = require('./package').jest || require('./jest.config')
            delete jestConfig.transform['^.+\\.tsx?$']
            w.testFramework.configure(jestConfig)
        }
    }
}
