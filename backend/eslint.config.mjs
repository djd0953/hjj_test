// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs', 'dist/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    prettier,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'commonjs',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            // ===== 포맷: Prettier가 담당 (brace-style, indent, semi, comma-dangle, object-curly-spacing) =====
            // ===== max-len만 Prettier가 커버 못 하므로 유지 =====
            '@stylistic/max-len': ['warn', {
                code: 120,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true
            }],

            // ===== unused-vars =====
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            // ===== TS 관련 =====
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/consistent-type-assertions': [
                'warn',
                {
                    assertionStyle: 'as',
                    objectLiteralTypeAssertions: 'allow',
                },
            ],
            '@typescript-eslint/ban-ts-comment': [
                'warn',
                {
                    'ts-ignore': 'allow-with-description',
                    'ts-expect-error': 'allow-with-description',
                    'ts-nocheck': true,
                    'ts-check': false,
                    minimumDescriptionLength: 3,
                },
            ],

            // ===== 안전벨트 =====
            eqeqeq: ['error', 'always'],
            'no-cond-assign': ['error', 'except-parens'],
            'no-fallthrough': 'error',
            'default-case-last': 'error',
            'no-duplicate-case': 'error',
            'no-unsafe-finally': 'error',
            'no-useless-catch': 'off',
            'no-useless-escape': 'off',
            'no-prototype-builtins': 'off',

            // console.log 경고
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
);
