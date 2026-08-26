# CLAUDE.md — 세션 부트스트랩

이 프로젝트는 `.claude/` 하위를 **구조화된 메모리/작업 관리 규약**으로 운영한다.
전체 구조와 사용법 설명은 `.claude/index.md` 참고.

## 1. 세션 시작 시 (항상)

아래 파일들을 **먼저 읽고** 작업을 시작한다:

- `.claude/memory/architecture/*.md` — 프로젝트 전체 구조/설계도
- `.claude/memory/rule/*.md` — 반드시 지켜야 하는 규칙
- `.claude/memory/convention/*.md` — 코드/작업 컨벤션

## 2. 작업(task) 진행 시

사용자가 특정 작업명을 언급하면, 해당 작업 폴더의 문서를 읽고 맥락을 잡는다:

- `.claude/projects/{작업명}/spec.md` — 배경 / 목적 / 설계 방향 / 참조
- `.claude/projects/{작업명}/current.md` — 진행 체크리스트 (지금 어디까지 했나 / 뭐가 남았나)
- `.claude/projects/{작업명}/history.md` — 날짜별 진행 요약 (이전 맥락 이어받기)
- `.claude/projects/{작업명}/request.md` — 아직 결정/해소 안 된 열린 항목
- `.claude/projects/{작업명}/ref/` — 참고 파일 + **지식 노트** (목록은 `ref/README.md`)
  `plan.md` 는 스텝마다 비워지므로, **오래 쓸 배경 지식은 비우기 전에 여기로 옮긴다.**

## 3. 운영 규칙

- **request → spec 승격**: `request.md`의 항목이 대화로 해소되면, 그 내용을 `spec.md`에 반영하고 `request.md`에서 해당 항목을 **제거**한다.
- **history 기록**: 작업이 한 단계 진전될 때마다 `history.md`에 날짜별로 간략히 요약을 남긴다. (새 세션에서 이어가기 위함)
- **current 갱신**: `current.md`의 할 일이 완료되면 `- [x]`로 체크한다. (삭제하지 않음. 사용자가 진척을 보기 위함)
- **plan.md 비우기 전 지식 이관**: `plan.md` 에 쌓인 설명 중 다음 스텝에도 쓸 것은 `ref/` 로 주제별로 옮기고,
  `plan.md` 에는 링크만 남긴다. 설계 **결정**은 `ref/` 가 아니라 `spec.md` 로 승격한다.
- **새 작업 시작**: `.claude/projects/_TEMPLATE/`를 복사해서 `{작업명}` 폴더로 만든다.
