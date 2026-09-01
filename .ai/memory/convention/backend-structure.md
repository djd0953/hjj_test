# 백엔드 구조 컨벤션 (NestJS)

`backend/`의 코드 배치 규약. 전체 구조 설명은 [[backend]] 참고.

## 1. 모든 코드는 `src/` 하위에 둔다

`backend/src/` 밖에 소스 코드를 두지 않는다.

## 2. 최상위 4구역: `error` / `libs` / `utils` / `modules`

| 폴더 | 무엇을 넣나 | 판단 기준 |
|------|-------------|-----------|
| `libs/` | **외부 라이브러리**를 시스템에서 쓰기 편하게 미리 module로 감싼 것 | "외부 lib를 module에서 편히 쓰려고 래핑" → libs |
| `utils/` | **순수 헬퍼 함수** | DB 접근 X, 외부 통신 X, 여러 모듈이 공통으로 쓰기 좋은 순수 함수 → utils |
| `modules/` | 각 **엔드포인트/기능**을 담당 | 요청을 받는 기능 단위 → modules |
| `error/` | 전역 에러 시스템 | [[backend-error]] |

### libs 규약
- 외부 라이브러리(AWS SDK, exceljs 등)를 감싸 **NestJS module로 미리 만들어 두고**, 다른 모듈이 주입받아 사용.
- 패턴: `libs/{name}/{name}.module.ts`가 내부 Service들을 `providers` + `exports`. (예: `AwsModule` → `S3Service` 등 export)

### utils 규약
- **DB와 무관, 외부로 나가는 통신 없음, 순수 입출력 함수**만.
- 여러 모듈에서 공통으로 쓰기 좋은 헬퍼를 모아 둠. (예: `common.ts`, `patterns.ts`)

## 3. module 내부 구성

각 모듈은 공통적으로 다음을 가진다:

```
modules/{name}/
├── controllers/   # HTTP 요청 진입 (WS 모듈은 gateways/ 로 대체)
├── dto/           # 이 모듈에서 쓰는 타입 정의
├── services/      # 실제 비즈니스 로직 레이어
└── {name}.module.ts   # DI 주입용 모듈 (providers/controllers/exports)
```

필요에 따라 아래 하위 폴더를 추가한다 (기존 코드 관례):
`constants/`, `utils/`(모듈 전용 헬퍼), `gateways/`(WebSocket), `files/`(정적 json 등), `services/{sub}/`(기능별 세부 분할 + `index.ts`)

### 레이어별 역할
- **dto**: 모듈에서 사용할 타입 등을 정의. (현재는 class-validator가 아니라 **TS interface/type**로 정의 — 런타임 검증 파이프는 아직 없음)
- **services**: 실제 비즈니스 로직이 들어가는 레이어.
- **controllers**: request/미들웨어로 받은 데이터를 service가 쓰기 좋은 형태로 가공해 service를 호출하고, 그 결과를 **FE가 쓰기 좋은 형태의 response로 가공**하는 역할.
- **module**: NestJS 표준대로 DI 주입 가능하게 모듈화.
- **WebSocket 모듈**: controller 대신 `gateways/*.gateway.ts`(`@WebSocketGateway`)가 진입점 역할. (예: `game`, `ws` 모듈)

## 4. Path alias

폴더별 명시적 alias 사용, catch-all(`@/*`) 금지:
`@error/*` `@lib/*` `@module/*` `@util/*` `@types/*`

## 5. DB / ORM (도입 예정 — 일부 미확정)

아직 DB 미사용. 도입 시 **선호하는 형태**:
- ORM은 **TypeORM vs Prisma 검토 중** (미확정).
- service 레이어에서 **DB CRUD 헬퍼 함수를 호출**하는 형태.
- 호출 시 **transaction 또는 db 객체를 만들어** 그 CRUD 헬퍼에 넘겨서 사용.
- 구체 코드 수정은 실제 도입 시점에 결정.

> ⚠️ 미확정 항목 (결정 전까지 임의로 정하지 말 것):
> - DB 관련 코드(연결/CRUD 헬퍼/엔티티·스키마)를 **어디에 위치**시킬지
> - **미들웨어 / 데코레이터**를 만들면 **어디에 위치**시킬지
