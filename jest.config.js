module.exports = {
    moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
    transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.vue$': 'vue-jest',
        '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    snapshotSerializers: ['jest-serializer-vue'],
    collectCoverage: false,
    testMatch: ['**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'],
    transformIgnorePatterns: ['node_modules/(?!vue-smooth-reflow)/'],
    testURL: 'http://localhost/',
    globals: {
        'ts-jest': {
            tsConfig: 'tsConfig.jest.json',
        },
        'vue-jest': {
            tsConfig: 'tsConfig.jest.json',
        },
    },
};
