# AI 세션 공용 부트스트랩

이 저장소의 agent 작업 메모리와 프로젝트 관리 규칙의 canonical source다.
Claude Code는 루트 `CLAUDE.md`를 통해, Codex는 루트 `AGENTS.md`를 통해 이 문서를 읽는다.
두 진입점에는 이 규칙을 복제하지 않는다.

## 세션 시작 시 (항상)

아래 파일들을 먼저 읽고 작업을 시작한다.

- `.ai/memory/architecture/*.md` — 프로젝트 전체 구조/설계도
- `.ai/memory/rule/*.md` — 반드시 지켜야 하는 규칙
- `.ai/memory/convention/*.md` — 코드/작업 컨벤션

## backend 작업 진행 시

사용자가 특정 작업명이나 프로젝트명을 언급하면 해당 작업 폴더의 문서를 읽는다.

- `.ai/projects/{작업명}/spec.md` — 배경 / 목적 / 설계 방향 / 참조
- `.ai/projects/{작업명}/current.md` — 진행 체크리스트
- `.ai/projects/{작업명}/history.md` — 날짜별 진행 요약
- `.ai/projects/{작업명}/request.md` — 아직 결정/해소되지 않은 열린 항목
- `.ai/projects/{작업명}/ref/` — 참고 파일과 지식 노트 (`ref/README.md`가 있으면 목록부터 읽음)
- `.ai/projects/{작업명}/plan.md` — 코드 수정 지시서

`plan.md`에 쌓인 설명 중 다음 스텝에도 필요한 배경 지식은 비우기 전에 `ref/`로 주제별 이관한다.
설계 결정은 `ref/`가 아니라 `spec.md`로 승격한다.

backend 작업은 `.ai/memory/rule/plan-md-workflow.md`의 지시서 검토·사용자 반영 방식을 따른다.

## frontend 작업 진행 시

frontend 작업은 `spec.md`, `current.md`, `history.md`, `ref/`만 작업 문서로 사용한다.

- `spec.md` — 배경, 목적, 확정한 설계 방향과 중요한 결정
- `current.md` — 사용자에게 보이는 진행 체크리스트
- `history.md` — 날짜별 append-only 진행 요약
- `ref/` — 외부 참고 자료, 화면·기술 조사 노트 (`ref/README.md`가 있으면 목록부터 읽음)

새 frontend 작업은 `.ai/projects/{작업명}/` 아래에 위 네 항목만 만들며, backend용 `_TEMPLATE`을 그대로 복사하지 않는다. 기존 frontend 작업 폴더에 남은 `request.md`, `plan.md`는 이전 기록으로 보존하되 새 작업 흐름에는 사용하지 않는다.

frontend는 agent가 설계·구현·검증·문서 갱신까지 주도한다. 매 변경마다 `plan.md` 지시서와 "플랜 적용해줘" 승인을 요구하지 않는다.

단, 아래처럼 구현 방향을 크게 좌우하거나 되돌리기 어려운 결정은 코드를 바꾸기 전에 사용자와 설계 방향을 먼저 합의한다.

- 페이지·메뉴 정보 구조를 바꾸는 일
- API 계약, 인증·권한, 데이터 모델·상태 관리 방식의 변경
- 새 라이브러리·외부 서비스·유료 의존성 도입
- 기존 기능의 제거, 데이터 손실 가능성이 있는 작업, 넓은 범위의 UI 재설계

사용자가 이미 방향·범위를 명확히 정한 일반 기능·UI 보완은 agent가 합리적인 세부 결정을 내려 바로 구현한다. 구현 뒤에는 `current.md`와 `history.md`를 갱신하고, 설계 결정은 `spec.md`에 기록한다.

## 공용 운영 규칙

- **request → spec 승격**: `request.md`의 항목이 대화로 해소되면 내용을 `spec.md`에 반영하고
  `request.md`에서 해당 항목을 제거한다.
- **history 기록**: 작업이 한 단계 진전될 때마다 해당 `history.md` 맨 아래에 날짜별 요약을 append한다.
  기존 기록은 수정하거나 삭제하지 않는다.
- **current 갱신**: `current.md`의 할 일이 완료되면 `- [x]`로 체크한다. 완료 항목을 삭제하지 않는다.
- **plan workflow**: backend 작업은 `plan.md` 지시서 검토와 사용자 반영을 기본으로 한다.
  frontend 작업은 위 "frontend 작업 진행 시" 규칙을 우선한다.
- **새 backend 작업 시작**: `.ai/projects/_TEMPLATE/`를 복사하여 `.ai/projects/{작업명}/`을 만든다.
- **코드와 문서의 범위**: 요청이 문서/메모리 관리라면 코드 파일을 수정하지 않는다.
  코드 변경이 필요한 경우에도 해당 프로젝트의 plan workflow와 사용자 승인 상태를 따른다.

## 경로 기준

`.ai/`가 프로젝트 지식과 공용 workflow의 canonical source다.
Claude Code의 `settings.local.json`처럼 특정 도구의 로컬 설정은 `.ai/`로 옮기지 않고 도구 전용 위치에 둔다.
