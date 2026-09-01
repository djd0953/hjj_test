# backend (NestJS)

`backend/`는 이 저장소의 **API / WebSocket 서버**. NestJS 11 + Express 플랫폼 + socket.io.
상당 부분이 사내 서비스("Lawform" / HSAD SP)를 **로컬에서 흉내 내는 mock/테스트 스캐폴드**라, 실제 프로덕션 로직보다 "흐름 테스트용" 코드가 섞여 있다.

## 스택 / 실행

- **NestJS 11**, `@nestjs/platform-express`, `@nestjs/websockets` + `@nestjs/platform-socket.io`
- 실행: `npm run dev` (= `nest start --watch`), 포트 **9090** (`PORT` env)
- 빌드: `nest build` → `dist/`, 프로덕션 `node dist/main`
- lint/format: `npm run lint` (eslint --fix), `npm run format` (prettier) — 스타일은 도구가 강제

## 진입점 (`src/main.ts`)

- `enableCors({ origin: true, credentials: true, ... })` — ⚠️ 모든 출처 반사 허용. 공개 배포 시 특정 origin으로 조여야 함
- `cookieParser()` 적용 (→ 향후 JWT-쿠키 인증 대비, [[frontend]] 인증 논의 참고)
- `bodyParser` json/urlencoded 1mb 제한
- `IoAdapter` 등록 → socket.io 게이트웨이 활성화

## 루트 모듈 (`src/app.module.ts`)

- `ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" })` — 전역 env
- 등록 모듈: `CodeModule`, `AwsModule`, `GameModule`, `WsModule`, `HsadModule`, `NotificationModule`

## 폴더 구조 (`src/`)

```
src/
├── main.ts, app.module.ts
├── error/            # 전역 에러 시스템 (i18n 에러코드 → ApiError)
├── libs/             # 외부 라이브러리 래핑 모듈 (aws, exceljs)
├── modules/          # 엔드포인트 담당 (기능별)
└── utils/            # 순수 헬퍼 (DB·외부통신 없음)
```

> 구조를 어떻게 나누고 뭘 어디에 두는지의 **규약**은 [[backend-structure]] 참고. 에러 정의 규약은 [[backend-error]].

## 모듈 (`src/modules/`)

| 모듈 | 종류 | 역할 |
|------|------|------|
| `code` | HTTP | `/code/*` — 키워드로 여러 코드 스니펫을 디스패치하는 플레이그라운드. `services/codes/*`에 기능별 파일 + `index.ts` |
| `hsad` | HTTP | `/hsad/*` — HSAD "Difference" 연동 mock. FE 트리거를 받아 Lawform(`localhost:8000`)로 프록시하거나, JSON 파일로 in/out 데이터 흉내 |
| `game` | **WS** | 블랙잭 게임 서버. `gateways/blackjack.gateway.ts`(socket.io) + service + `utils/` + `constants/` |
| `ws` | **WS** | 범용 socket.io 게이트웨이. namespace `/ws`, ping/echo/message 등 (FE `/logs` 콘솔이 여기 붙음) |
| `notification` | (빈 스캐폴드) | 알림/이메일 이벤트용. 현재 `dto`에 타입만 있고 controller/service 미구현 |

## libs (`src/libs/`)

외부 라이브러리를 NestJS 모듈로 감싸 주입해 쓰는 형태 ([[backend-structure]]).

- `aws/` — `AwsModule`이 `S3Service`, `SqsService`, `KmsService`, `SMService`(Secrets Manager), `OpenSearchService`를 export. 각 Service는 constructor에서 `ConfigService.getOrThrow(...)`로 자격증명 로드
- `exceljs/` — `ExcelJsModule` → `ExcelJsService`

## error (`src/error/`)

- `constants/error.const.ts` — `API_ERROR_CODE`: 상태코드 + ko/en/ja i18n title·message를 가진 에러 카탈로그
- `dto/error.dto.ts` — `I18nText`/`I18nMessage`, `ErrorCodeKey` 등 타입
- `services/error.service.ts` — `ApiError`(throw용 커스텀 에러), `resolveLocaleFromAcceptLanguage`, `pickTitle`/`pickMessage`
- 사용: `throw new ApiError(API_ERROR_CODE.XXX)` — 정의 추가 규약은 [[backend-error]]

## utils (`src/utils/`)

DB·외부통신 없는 순수 헬퍼. 예: `common.ts`(`getJsonObjectOrThrow`), `patterns.ts`(정규식 카탈로그 `Patterns` + `PatternValidator`), `updateHtmlCode/*`(HTML→DOCX 변환 헬퍼).

## Path alias (`tsconfig.json`)

폴더별 명시적 alias (catch-all 없음):
`@error/*` `@lib/*` `@module/*` `@util/*` `@types/*`

## env / 설정

- `ConfigModule` 전역, Service들이 `ConfigService.get`/`getOrThrow`로 읽음
- ⚠️ **`backend/.env`에 실제 형식의 AWS 키·DB 비밀번호·JWT_KEY가 들어있음** (`.gitignore`로 git 추적은 안 됨). 값은 여기 기록하지 않음. 진짜 키면 rotate 권장.
- ORM/DB는 아직 미사용. `@prisma/client`가 deps에 있으나 실제 DB 접속 코드는 없음 (도입 시 [[backend-structure]]의 DB 규약 참고)
