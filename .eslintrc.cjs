module.exports = {
    root: true,
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
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:promise/recommended"
    ],
    rules: {
    // ===== 포맷 관련 (네가 원하는 스타일) =====
        "brace-style": ["error", "allman", { allowSingleLine: true }],
        indent: ["error", 4, { SwitchCase: 1 }],
        "object-curly-spacing": ["error", "always"],
        "comma-dangle": ["error", "never"],

        // 세미콜론 (기본 semi만 사용)
        semi: ["error", "always"],

        // try/catch 래핑 과하다고 보는 룰 비활성
        "no-useless-catch": "off",

        // 불필요한 escape 문자 신경 안 쓰고 싶으면 off
        "no-useless-escape": "off",

        // hasOwnProperty 관련 엄격 룰 끄기
        "no-prototype-builtins": "off",

        // unused-vars는 TS 버전만 경고 수준으로
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

        "max-len": [
            "off",
            {
                code: 140,
                tabWidth: 4,
                ignoreComments: true,
                ignoreUrls: true
            }
        ],

        // import 정렬 (group 수준만)
        "import/order": [
            "warn",
            {
                groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                "newlines-between": "always"
            }
        ],

        // === 가독성에 문제 될만한 애들 경고!! ===
        // 타입 캐스팅 스타일 통일 (angle-bracket <T> 대신 as만 쓰도록)
        "@typescript-eslint/consistent-type-assertions": [
            "warn",
            {
                assertionStyle: "as",
                objectLiteralTypeAssertions: "allow"
            }
        ],

        // optional chaining / nullish coalescing 사용 권장 (가독성)
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/prefer-optional-chain": "off",

        // console.log는 남겨도 되는데, 최소 warning은 받고 가자
        "no-console": [
            "warn",
            {
                allow: ["warn", "error"]
            }
        ],

        // === 뻘짓 방지용 안전벨트 ===
        // == / != 대신 항상 === / !== 사용
        eqeqeq: ["error", "always"],

        // if (a = b) 처럼 조건 안에서 실수로 대입하는 거 방지
        "no-cond-assign": ["error", "except-parens"],

        // switch case 빠져나가는 거 까먹는 실수 방지
        "no-fallthrough": "error",

        // switch에서 default는 항상 맨 마지막에
        "default-case-last": "error",

        // 동일한 case 값 두 번 쓰는 실수 방지
        "no-duplicate-case": "error",

        // finally 블록에서 return / throw 등 위험 패턴 방지
        "no-unsafe-finally": "error",

        "@typescript-eslint/no-explicit-any": "off",

        // Promise 리턴하는 함수를 await 안 하고 흘려보내는 실수 방지
        "@typescript-eslint/no-floating-promises": "off",

        // async 함수 아닌 곳에서 Promise를 바로 넘기는 실수 등 방지
        "@typescript-eslint/no-misused-promises": "off"
    },
    settings: {
        "import/resolver": {
            typescript: {
                project: "./tsconfig.json"
            }
        }
    }
};
