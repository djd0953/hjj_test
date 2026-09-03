module.exports = {
    root: true,
    ignorePatterns: ["next-env.d.ts"],
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:promise/recommended"
    ],
    rules: {
        "brace-style": ["error", "allman", { allowSingleLine: true }],
        indent: ["error", 4, { SwitchCase: 1 }],
        "object-curly-spacing": ["error", "always"],
        "comma-dangle": ["error", "never"],
        semi: ["error", "always"],
        "no-useless-catch": "off",
        "no-useless-escape": "off",
        "no-prototype-builtins": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }
        ],
        "@typescript-eslint/ban-ts-comment": [
            "warn",
            {
                "ts-ignore": "allow-with-description",
                "ts-expect-error": "allow-with-description",
                "ts-nocheck": true,
                "ts-check": false,
                minimumDescriptionLength: 3
            }
        ],
        "max-len": "off",
        "import/order": [
            "warn",
            {
                groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                "newlines-between": "always"
            }
        ],
        "@typescript-eslint/consistent-type-assertions": [
            "warn",
            {
                assertionStyle: "as",
                objectLiteralTypeAssertions: "allow"
            }
        ],
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        eqeqeq: ["error", "always"],
        "no-cond-assign": ["error", "except-parens"],
        "no-fallthrough": "error",
        "default-case-last": "error",
        "no-duplicate-case": "error",
        "no-unsafe-finally": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-misused-promises": "off"
    },
    settings: {
        "import/resolver": {
            typescript: {
                project: "./tsconfig.json",
                alwaysTryTypes: true
            },
            node: {
                extensions: ['.js', '.ts', '.tsx', '.json']
            }
        }
    }
};
