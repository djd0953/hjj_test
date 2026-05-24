# HJJ Project Context

이 문서는 GPT/Codex 같은 AI 작업자가 프로젝트를 빠르게 이해하도록 만든 요약 문서입니다. 코드 수정 전에 이 파일과 관련 모듈의 실제 코드를 함께 확인하세요.

## 한 줄 요약

NestJS 백엔드와 Next.js 프론트엔드로 구성된 풀스택 실험/목업 프로젝트입니다. 주요 기능은 API Playground, HSAD/Difference/MDM mock API, 여러 미니게임, WebSocket 기반 온라인 블랙잭입니다.

## 저장소 구조

```text
hjj/
  backend/                 NestJS API 서버
    src/
      app.module.ts
      main.ts
      libs/aws/            AWS S3, SQS, KMS, Secrets Manager, OpenSearch 래퍼
      libs/exceljs/        Excel export helper
      modules/code/        API Playground용 유틸 코드 실행 모듈
      modules/game/        블랙잭 WebSocket 서버
      modules/hsad/        HSAD Difference/MDM mock API
      utils/               DOCX/HTML 변환 및 공통 유틸
  frontend/                Next.js pages router 앱
    pages/
      index.tsx            API Playground + HSAD trigger UI
      game.tsx             미니게임 선택 화면
      logs.tsx             블랙잭 WebSocket 디버그 로그 화면
    components/games/      미니게임 컴포넌트들
  .claude/                 기능 명세/요청 문서 일부 보관
  docker-compose*.yml      개발/운영 컨테이너 설정
```

## 실행 환경

- OS: Windows 개발 환경 기준으로 보입니다.
- 루트 패키지 매니저: npm
- 백엔드: NestJS 11, TypeScript, Node 22 계열 Dockerfile
- 프론트엔드: Next.js 15 pages router, React 19, Tailwind CSS 4
- 백엔드 기본 포트: `9090`
- 프론트엔드 npm script 포트: `9080`
- 블랙잭 WebSocket: `ws://<host>:9090/ws/blackjack`
- HSAD outbound mock target: `http://localhost:8000/api/hsad/difference/*`

PowerShell에서 `npm`이 실행 정책에 막힐 수 있습니다. 이 경우 `npm.cmd run build`처럼 `npm.cmd`를 사용하면 됩니다.

## 주요 명령어

루트:

```powershell
npm.cmd run dev
npm.cmd run build
```

백엔드:

```powershell
cd backend
npm.cmd run dev
npm.cmd run build
npm.cmd run test
```

프론트엔드:

```powershell
cd frontend
npm.cmd run dev
npm.cmd run build
```

마지막 확인 시점에 `backend`와 `frontend` 모두 `npm.cmd run build`는 성공했습니다.

## 백엔드 개요

진입점:

- `backend/src/main.ts`
- `backend/src/app.module.ts`

`main.ts`에서 CORS를 넓게 열고, body size limit을 `1mb`로 설정하며, `@nestjs/platform-ws`의 `WsAdapter`를 사용합니다.

등록 모듈:

- `CodeModule`
- `AwsModule`
- `GameModule`
- `HsadModule`

### CodeModule

경로:

- `backend/src/modules/code`

역할:

- API Playground에서 keyword별 샘플/유틸 코드를 실행합니다.
- 컨트롤러는 `/code/list`, `/code/:type/:keyword`를 제공합니다.
- `CodeService`가 keyword를 switch로 분기하여 `src/modules/code/services/codes/*` 함수를 호출합니다.

관련 AWS dependency:

- `S3Service`
- `KmsService`
- `SMService`

주의:

- `CodeKeywords`에는 `sentEvent`, `woffToTtf`가 있지만 실제 switch에서는 처리되지 않거나 주석 처리된 항목이 있습니다.
- 프론트 `index.tsx`는 현재 `/code/...`가 아니라 `/${mode}/${keyword}` 형식으로 요청하도록 되어 있어 백엔드와 불일치합니다.

### HsadModule

경로:

- `backend/src/modules/hsad`
- 참고 명세: `.claude/mdm-be/*.md`, `.claude/difference/*.md`

역할:

- MDM mock API
- Difference/CLM mock API
- 프론트에서 Lawform mock API를 호출해보는 trigger endpoint

주요 endpoint:

- `GET /mdm/list`
- `POST /mdm/check`
- `POST /hsad/cm/rest/BRS_SM_CLM_JobList`
- `POST /hsad/cm/rest/BRS_SM_CLM_SaveReviewed`
- `POST /hsad/trigger/1` ~ `POST /hsad/trigger/5`

데이터 저장:

- `backend/src/modules/hsad/file/mdm_list.json`
- `backend/src/modules/hsad/file/job_list.json`
- `backend/src/modules/hsad/file/clm.json`

주의:

- JSON 파일을 mock DB처럼 직접 읽고 씁니다.
- `process.cwd()` 기준으로 `src/modules/hsad/file`을 찾으므로 실행 위치가 바뀌면 파일 경로 문제가 생길 수 있습니다.

### GameModule / Blackjack

경로:

- `backend/src/modules/game`

구성:

- `gateways/blackjack.gateway.ts`
- `services/blackjack.service.ts`
- `dto/blackjack.dto.ts`
- `constants/blackjack.constant.ts`
- `utils/blackjack.util.ts`

역할:

- `/ws/blackjack` WebSocket gateway
- 최대 8인 온라인 블랙잭 방
- betting, dealing, playerTurn, dealerTurn, settlement 상태 관리
- hit, stand, double, split, ready, bet 메시지 처리

기본 룰 상수:

- `NUM_DECKS = 6`
- `MAX_PLAYERS = 8`
- `INITIAL_CHIPS = 1000`
- `MIN_BET = 10`
- `DEFAULT_BET = 50`
- `BETTING_TIMEOUT_MS = 30_000`
- `SETTLEMENT_TIMEOUT_MS = 5_000`

주의:

- Gateway의 client/socket 매핑과 service의 `clientId`/`playerId` 조회 흐름을 변경할 때 조심해야 합니다.
- 특정 클라이언트에게 보내는 `welcome`, `bankrupt`류 메시지가 정상 전달되는지 WebSocket 로그 페이지에서 검증하는 것이 좋습니다.

## 프론트엔드 개요

진입점:

- `frontend/pages/_app.tsx`
- `frontend/components/Layout.tsx`

라우트:

- `/`: API Playground + HSAD trigger UI
- `/game`: 미니게임 선택 UI
- `/logs`: WebSocket raw 로그 UI

### API Playground

경로:

- `frontend/pages/index.tsx`

역할:

- keyword 기반 API 호출 UI
- HSAD trigger endpoint 테스트 UI

주의:

- `getKeywords()` 내부의 `/code/list` 호출이 주석 처리되어 있어 keyword 목록이 비어 있습니다.
- `MODES`는 `brack`, `pass`인데 백엔드 CodeController는 `/code/:type/:keyword`입니다.
- `frontend/next.config.js`의 rewrite도 `/b`, `/p`만 프록시하고 있어 현재 UI와 맞지 않습니다.

### Game

경로:

- `frontend/pages/game.tsx`
- `frontend/components/games/*`

역할:

- BulletDodge, Snake, Pong, Breakout, FlappyBird, 2048, SpaceShooter, TowerSmash, Blackjack, BlackjackOnline을 선택 실행합니다.

주의:

- 여러 파일에서 한글 문구가 인코딩 깨짐 상태입니다.
- `Blackjack.tsx`는 로컬 단독 게임이고, `BlackjackOnline.tsx`는 백엔드 WebSocket과 연동됩니다.

### Logs

경로:

- `frontend/pages/logs.tsx`

역할:

- `/ws/blackjack`에 연결해 raw WebSocket 메시지를 송수신하고 기록합니다.
- 온라인 블랙잭 디버깅 시 가장 빠른 확인 도구입니다.

## AWS/인프라 관련

백엔드 `AwsModule` 제공 서비스:

- `SMService`: AWS Secrets Manager에서 secret을 읽어 `process.env`에 병합
- `S3Service`: upload, retrieve, copy, delete, move, list, presigned URL
- `SqsService`
- `KmsService`: encrypt/decrypt
- `OpenSearchService`

필요한 env 예시:

```text
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_PRIVATE_BUCKET_NAME
AWS_PUBLIC_BUCKET_NAME
AWS_KMS_KEY_ID
AWS_SM_KEY_ID
PORT
NEXT_PUBLIC_WS_PORT
```

주의:

- `S3Service`는 생성자에서 AWS access key와 bucket env를 `getOrThrow`로 요구합니다. AWS env가 없으면 Nest 앱 부팅 시 실패할 수 있습니다.
- `KmsService`는 `AWS_KMS_KEY_ID`가 필요합니다.
- `SMService.load()`는 수동 호출되어야 secret을 env에 병합합니다. 현재 `AppModule`에서 자동 호출되는 구조는 아닙니다.

## Docker/Compose 메모

파일:

- `Dockerfile.dev`
- `Dockerfile.prod`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `docker-compose.prod.yml`

현재 설정상 주의할 점:

- 루트 `Dockerfile.dev`는 루트 `package*.json`만 설치한 뒤 루트 `npm run dev`를 실행합니다. 루트 script는 `backend`와 `frontend` 하위 폴더로 들어가므로, 컨테이너 안에서 하위 `node_modules`가 없으면 실패할 수 있습니다.
- `frontend/package.json`의 dev script는 `next dev -p 9080`인데, `frontend/Dockerfile`은 `EXPOSE 3000`, `docker-compose.yml`도 `3000:3000`입니다. 포트 설정이 맞지 않습니다.
- `Dockerfile.prod`의 CMD는 `node dist/app.js`인데 Nest 기본 빌드 산출물은 보통 `dist/main.js`입니다. 실제 산출물을 확인하고 맞춰야 합니다.

## 현재 눈에 띄는 기술 부채

- 한글 주석과 UI 문구가 다수 깨져 있습니다.
- 루트 `README.md`가 거의 비어 있습니다.
- API Playground 프론트 요청 경로와 백엔드 endpoint가 맞지 않습니다.
- Next.js 빌드 시 workspace root/lockfile 경고가 있습니다. 루트와 `frontend`에 `package-lock.json`이 각각 있어 Next가 루트 추론 경고를 냅니다.
- `backend/tsconfig*.tsbuildinfo`, `frontend/tsconfig.tsbuildinfo`는 빌드 캐시 파일입니다. 보통 직접 편집하지 않습니다.

## 다음 AI 작업자에게 권장하는 확인 순서

1. `git status --short`로 사용자가 작업 중인 파일을 확인합니다.
2. 이 문서를 읽고, 수정 대상 모듈의 controller/service/component를 실제 코드로 다시 확인합니다.
3. API 변경이면 프론트 요청 경로와 백엔드 endpoint를 함께 맞춥니다.
4. WebSocket 변경이면 `/logs` 페이지나 `BlackjackOnline`에서 실제 연결과 메시지 흐름을 확인합니다.
5. 빌드 검증은 Windows PowerShell에서 `npm.cmd run build`를 우선 사용합니다.

