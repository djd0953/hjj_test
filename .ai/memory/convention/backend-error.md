# 백엔드 에러 컨벤션

예상되는 에러는 **`src/error/constants/error.const.ts`의 `API_ERROR_CODE`에 정의**하고, 코드에서는 `ApiError`로 throw 한다.

## 정의 형태 (`API_ERROR_CODE`)

에러코드 키 하나 = `{ status, title(i18n), message(i18n) }`. i18n은 `ko-KR` / `en` / `ja` 3개 로케일.

```ts
export const API_ERROR_CODE = {
    INVALID_JSON: {
        status: 400,
        title: {
            "ko-KR": "파싱 오류",
            en: "Parse Error",
            ja: "パースエラー"
        },
        message: {
            "ko-KR": "JSON 파싱에 실패했습니다.",
            en: "Failed to parse JSON.",
            ja: "JSONのパースに失敗しました。"
        }
    },
    // ...
} as const;
```

### 규칙
- **키 이름**: `SCREAMING_SNAKE_CASE`, 의미 기반 (예: `MISSING_REQUIRED_FIELD`, `NOT_SET_S3_PATH`, `NOT_AWS_PERMISSION`).
- **status**: HTTP 상태코드 숫자.
- **title / message**: 세 로케일(`ko-KR`, `en`, `ja`) 모두 채운다.
- **그룹핑**: 파일 안에서 상태코드 구간(4xx/5xx)별로 주석 블록으로 묶어 정리한다. 새 에러는 해당 구간 주석 아래에 추가.
- `as const` 유지 (타입 추론에 사용됨).

## 타입 (`src/error/dto/error.dto.ts`)

- `I18nText` / `I18nMessage` — 로케일 3종 구조
- `ErrorCodeKey` = `keyof typeof API_ERROR_CODE`, `ErrorCodeValue` = 그 value 타입
- `SupportedLocale` = `"ko-KR" | "en" | "ja"`

## 사용 (`src/error/services/error.service.ts`)

- throw: `throw new ApiError(API_ERROR_CODE.INVALID_JSON);`
- `ApiError`는 `status`, `titleI18n`, `messageI18n`을 담는 커스텀 `Error`.
- 응답 시 로케일 선택: `resolveLocaleFromAcceptLanguage(acceptLanguage)` → `pickTitle` / `pickMessage`로 해당 로케일 문자열 추출 (없으면 ko-KR → en → ja 순 fallback).

## 요약
새 에러가 필요하면 → `error.const.ts`에 위 형태로 키 추가 → 코드에서 `throw new ApiError(API_ERROR_CODE.새키)`.
