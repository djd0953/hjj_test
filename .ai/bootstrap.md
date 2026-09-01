# AI 세션 공용 부트스트랩

이 저장소의 agent 작업 메모리와 프로젝트 관리 규칙의 canonical source다.
Claude Code는 루트 `CLAUDE.md`를 통해, Codex는 루트 `AGENTS.md`를 통해 이 문서를 읽는다.
두 진입점에는 이 규칙을 복제하지 않는다.

## 세션 시작 시 (항상)

아래 파일들을 먼저 읽고 작업을 시작한다.

- `.ai/memory/architecture/*.md` — 프로젝트 전체 구조/설계도
- `.ai/memory/rule/*.md` — 반드시 지켜야 하는 규칙
- `.ai/memory/convention/*.md` — 코드/작업 컨벤션

## 작업(task) 진행 시

사용자가 특정 작업명이나 프로젝트명을 언급하면 해당 작업 폴더의 문서를 읽는다.

- `.ai/projects/{작업명}/spec.md` — 배경 / 목적 / 설계 방향 / 참조
- `.ai/projects/{작업명}/current.md` — 진행 체크리스트
- `.ai/projects/{작업명}/history.md` — 날짜별 진행 요약
- `.ai/projects/{작업명}/request.md` — 아직 결정/해소되지 않은 열린 항목
- `.ai/projects/{작업명}/ref/` — 참고 파일과 지식 노트 (`ref/README.md`가 있으면 목록부터 읽음)
- `.ai/projects/{작업명}/plan.md` — 코드 수정 지시서

`plan.md`에 쌓인 설명 중 다음 스텝에도 필요한 배경 지식은 비우기 전에 `ref/`로 주제별 이관한다.
설계 결정은 `ref/`가 아니라 `spec.md`로 승격한다.

## 공용 운영 규칙

- **request → spec 승격**: `request.md`의 항목이 대화로 해소되면 내용을 `spec.md`에 반영하고
  `request.md`에서 해당 항목을 제거한다.
- **history 기록**: 작업이 한 단계 진전될 때마다 해당 `history.md` 맨 아래에 날짜별 요약을 append한다.
  기존 기록은 수정하거나 삭제하지 않는다.
- **current 갱신**: `current.md`의 할 일이 완료되면 `- [x]`로 체크한다. 완료 항목을 삭제하지 않는다.
- **plan workflow**: 기본적으로 agent는 `plan.md`에 지시서만 작성하고 사용자가 직접 코드를 반영한다.
  사용자가 정확히 "플랜 적용해줘"라고 하면 해당 plan을 검토한 뒤에만 agent가 코드에 적용한다.
  반영과 정합성 검사가 끝나면 plan 내용은 비우고 다음 청크에 재사용한다.
- **새 작업 시작**: `.ai/projects/_TEMPLATE/`를 복사하여 `.ai/projects/{작업명}/`을 만든다.
- **코드와 문서의 범위**: 요청이 문서/메모리 관리라면 코드 파일을 수정하지 않는다.
  코드 변경이 필요한 경우에도 해당 프로젝트의 plan workflow와 사용자 승인 상태를 따른다.

## 경로 기준

`.ai/`가 프로젝트 지식과 공용 workflow의 canonical source다.
Claude Code의 `settings.local.json`처럼 특정 도구의 로컬 설정은 `.ai/`로 옮기지 않고 도구 전용 위치에 둔다.
