# .claude 구조 가이드 (index)

이 문서는 `.claude/` 디렉토리 규약의 **전체 지도**다.
세션 자동 진입점은 `CLAUDE.md`이며, 이 파일은 사람이 구조를 이해하기 위한 설명서다.

## 디렉토리 구조

```
.claude/
├── CLAUDE.md            # 세션 자동 로드 진입점(부트스트랩). 세션 시작 규칙이 여기 있음
├── index.md             # (이 파일) 구조 설명서 / 지도
├── memory/              # 프로젝트 전역에 적용되는 규칙·컨벤션·설계
│   ├── architecture/    # 프로젝트 전체 그림/설계도. 주제별로 {내용}.md 분할
│   ├── rule/            # 반드시 지켜야 하는 규칙. 주제별로 {내용}.md 분할
│   └── convention/      # 코드/작업 컨벤션. 주제별로 {내용}.md 분할
└── projects/            # 작업별 워킹 메모리
    ├── _TEMPLATE/       # 새 작업 시작 시 복사하는 템플릿
    └── {작업명}/
        ├── spec.md      # 배경/목적/설계/참조 — 확정된 내용
        ├── current.md   # 진행 체크리스트 (사용자용, [x] 체크)
        ├── history.md   # 날짜별 진행 요약 (append-only, 세션 재개용)
        ├── request.md   # 결정/해소가 필요한 열린 항목
        ├── plan.md      # 코드 수정 지시서 (섹션/청크 단위, 재사용)
        └── ref/         # 이 작업에 필요한 참고 파일 (사용자가 직접 넣음)
```

## memory/ — 전역 메모리

세션 시작 시 항상 읽힌다. 내용의 성격에 따라 파일을 나눈다.

- **architecture/**: 프로젝트 전체 그림/설계도 (예: `system-overview.md`, `data-flow.md`)
- **rule/**: 어기면 안 되는 규칙 (예: `security.md`, `git.md`)
- **convention/**: 스타일·관례 (예: `naming.md`, `path-alias.md`, `commit.md`)

한 파일 = 하나의 주제. 파일명은 그 내용을 나타내는 kebab-case로.

## projects/ — 작업별 워킹 메모리

작업 하나당 폴더 하나. 세 문서의 역할이 명확히 다르다:

| 파일 | 역할 | 성격 |
|------|------|------|
| `spec.md` | 배경·목적·설계 방향·참조 파일·기타 | **확정**된 내용. request/history를 바탕으로 작성 |
| `current.md` | 진행 체크리스트 | **사용자용**. 뭘 했고 뭐가 남았나. `- [x]` 체크만(삭제 X). 세션 초기화 시 현재 지점 파악용 |
| `history.md` | 날짜별 대화·진행 요약 | **세션(Claude)용** 누적 기록. 재시작 시 맥락 주입. append-only — `rule/history-append-only.md` |
| `request.md` | 결정해야 할 것 / 애매해서 물어야 할 것 | **임시** 큐. 해소되면 spec으로 옮기고 여기서 제거 |
| `plan.md` | 코드 수정 지시서 | 섹션/청크 단위로 "어디를·어떻게·왜" 작성 → "플랜 적용해줘" 로 반영 → 비우고 재사용. `rule/plan-md-workflow.md` |

### 흐름

```
질문·미결정 사항  →  request.md 에 적재
        │
   대화로 해소
        ▼
   spec.md 에 반영  →  request.md 에서 해당 항목 제거
        │
   작업 진전 시
        ▼
   history.md 에 날짜별 요약
```

## 새 작업 시작하는 법

```bash
cp -r .claude/projects/_TEMPLATE .claude/projects/{작업명}
```

이후 세션에서 "`{작업명}` 작업 하자"라고 하면, 해당 폴더의 `spec/history/request`를 읽고 이어간다.
