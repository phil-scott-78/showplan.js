module.exports = {
    env: {
        mocha: true,
    },
    rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-unused-expressions': 0,
        'chai-friendly/no-unused-expressions': 2,
    },
    plugins: ['chai-friendly'],
};
