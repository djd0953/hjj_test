module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: ['eslint:recommended', 'plugin:promise/recommended', 'plugin:import/recommended', 'standard'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        semi: ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'brace-style': ['error', 'stroustrup'],
        indent: ['error', 4],
        'object-curly-spacing': ['error', 'always']
    }
};
