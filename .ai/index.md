# .ai 구조 가이드 (index)

이 문서는 .ai/ 디렉토리 규약의 전체 지도다.
공용 세션 규칙은 bootstrap.md에 있고, 이 파일은 사람이 구조를 이해하기 위한 설명서다.

## 자동 진입 흐름

    Claude Code → CLAUDE.md → .ai/bootstrap.md → .ai/memory/* → .ai/projects/*
    Codex       → AGENTS.md  → .ai/bootstrap.md → .ai/memory/* → .ai/projects/*

## 디렉토리 구조

    .ai/
    ├── bootstrap.md         # Claude Code/Codex가 공유하는 canonical 세션 규칙
    ├── index.md             # 이 파일: 구조 설명서 / 지도
    ├── memory/
    │   ├── architecture/    # 프로젝트 전체 그림/설계도
    │   ├── rule/            # 반드시 지켜야 하는 규칙
    │   └── convention/      # 코드/작업 컨벤션
    └── projects/
        ├── _TEMPLATE/       # 새 작업 시작 시 복사하는 기본 템플릿
        └── {작업명}/
            ├── spec.md      # 배경/목적/설계/참조 — 확정된 내용
            ├── current.md   # 진행 체크리스트 (사용자용, [x] 체크)
            ├── history.md   # 날짜별 진행 요약 (append-only)
            ├── ref/         # 필요 시: 이 작업에 필요한 참고 파일
            ├── request.md   # 필요 시: 결정/해소가 필요한 열린 항목
            └── plan.md      # 선택 시: 코드 수정 지시서 (섹션/청크 단위)

## memory/ — 전역 메모리

세션 시작 시 항상 읽힌다. 내용의 성격에 따라 파일을 나눈다.

- architecture/: 프로젝트 전체 구조/설계도
- rule/: 어기면 안 되는 규칙
- convention/: 스타일·관례·작업 방식

한 파일 = 하나의 주제. 파일명은 내용을 나타내는 kebab-case로 한다.

## projects/ — 작업별 워킹 메모리

작업 하나당 폴더 하나를 둔다. 문서 역할은 다음과 같다.

| 파일 | 역할 | 성격 |
|------|------|------|
| spec.md | 배경·목적·설계 방향·참조 | 확정된 내용 |
| current.md | 진행 체크리스트 | 사용자용. 완료 항목은 [x]로 체크하고 삭제하지 않음 |
| history.md | 날짜별 진행 요약 | 세션(agent) 재개용 누적 기록. append-only |
| request.md | 결정해야 할 것 | 선택 문서. 열린 항목이 있을 때만 만들며, 해소되면 spec으로 승격 |
| plan.md | 코드 수정 지시서 | 선택 문서. 코드 작업 전 사용자가 검토 방식을 선택했을 때만 사용 |
| ref/ | 참고 파일·지식 노트 | plan에서 오래 보존할 배경 지식 이관처 |

## 문서 흐름

    질문·미결정 사항 → request.md (필요 시)
              ↓ 대화로 해소
            spec.md ← 확정된 설계
              ↓ 작업 진전
           history.md
           current.md

설계가 확정되어 코드 작업으로 넘어갈 때 agent가 구현 방식을 먼저 확인한다.
기본은 `plan.md` 없이 자율 진행하며, 사용자가 원하면 작업 전체 또는 섹션/청크 단위로
`plan.md` 검토 흐름을 선택할 수 있다.

## 새 작업 시작

    cp -r .ai/projects/_TEMPLATE .ai/projects/{작업명}

그 다음 spec/current/history를 작업 목적에 맞게 작성한다. `ref/`, `request.md`, `plan.md`는
필요한 경우에만 추가한다. `plan.md` 선택·반영 절차는 `memory/rule/plan-md-workflow.md`를 따른다.
특정 agent 전용 설정 파일은 .ai/로 옮기지 않고 원래 도구 전용 위치에 유지한다.
