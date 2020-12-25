
module.exports = {
    extends: ['@cdoublev/eslint-config/node'],
    overrides: [
        {
            extends: ['@cdoublev/eslint-config/jest'],
            files: ['__tests__/*.js'],
        },
        {
            extends: ['@cdoublev/eslint-config/browser'],
            files: ['src/**/*.js'],
            settings: {
                polyfills: ['Object'],
            },
        },
    ],
}
