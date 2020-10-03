
module.exports = {
    overrides: [
        {
            extends: ['@cdoublev/eslint-config/jest'],
            files: ['__tests__/*.js'],
        },
        {
            extends: ['@cdoublev/eslint-config/browser', '@cdoublev/eslint-config/node'],
            files: ['src/**/*.js'],
            settings: {
                polyfills: ['Object'],
            },
        },
    ],
}
