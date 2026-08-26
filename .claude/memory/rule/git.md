# Git 사용 규칙

git 명령을 위험도에 따라 다룬다.

## 🔴 절대 실행 금지 — 원격 반영 / 이력 파괴

- `git push` (`--force` 포함)
- `git merge`
- 그 외 **원격에 반영**하거나 **이미 만든 이력을 파괴**하는 모든 명령

원격에 올릴 필요가 있으면 실행하지 말고 **사용자에게 요청**한다.

## 🟠 조건부 허용 — `git commit`

**커밋은 해도 된다.** 단 아래 형식과 절차를 지킬 때만.
형식은 lawform `rules/commit.md` 를 따른다 (**Jira 이슈번호만 생략** — 우리는 Jira 를 쓰지 않는다).

### 커밋 메시지 형식

```
<Prefix>: <변경 위치 및 내용>

<본문 — 필요할 때만>
```

- **Prefix 필수.** 아래 표준 셋만 사용한다
- **제목은 72자 이내.** `git log --oneline` 과 GitHub 에서 잘리지 않는 길이
- **본문은 길이 제한 없음. 단 기본은 본문 없이 제목 한 줄이다.**
  부가 설명이 불가피할 때만 빈 줄 뒤에 추가한다
  → **왜 그렇게 결정했는지 같은 깊은 맥락은 `projects/{작업}/history.md` 가 담당한다.**
    커밋 본문에 중복해서 쓰지 않는다
- 언어는 **한국어** (기존 커밋 로그와 일관)

### Prefix 표준 (이 11개만, 커스텀 금지)

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/ko/v1.0.0/) 표준 type.

| Prefix | 용도 |
|---|---|
| `Feat` | 새 기능 추가 |
| `Fix` | 버그 수정 (동작에 영향 있는 오타/철자 교정 포함) |
| `Docs` | 문서만 수정 (README, `.claude/**`, 주석 등) |
| `Style` | 포맷팅, 공백 등 **동작 무관** 변경 |
| `Refactor` | 기능 추가·버그 수정 없이 내부 구조 개선 (동작 무관한 식별자 오타 교정 포함) |
| `Perf` | 성능 개선 |
| `Test` | 테스트 코드 추가/수정 |
| `Build` | 빌드 시스템·의존성 변경 (gradle, 버전 카탈로그, Kotlin/Boot 버전 등) |
| `Ci` | CI 설정/스크립트 변경 |
| `Chore` | 위 어디에도 속하지 않는 잡무 (`.gitignore`, 도구 설정 등) |
| `Revert` | 이전 커밋 되돌리기 |

❌ `Refact` / `Update` / `Modify` / `Typo` / `Hotfix` 등 비표준·모호한 Prefix 금지.

### 제목 — 변경 위치와 내용을 함께 쓴다

**어떤 파일·클래스·메서드의 무엇을** 어떻게 했는지 드러나야 한다.
커밋 메시지만 읽어도 작업 내용이 대체로 설명되어야 한다.

```
// Good
Feat: CodeController 에 GET /code/{keyword} 디스패처 엔드포인트 추가
Fix: CodeService 없는 keyword 요청이 200 + null 을 반환하던 문제 보완
Refactor: LoggingErrorHandler 로 에러 응답 생성 일원화
Build: springdoc-openapi 3.1.0 추가

// Bad
수정                      // 무엇을 수정했는지 모름
코드 정리                  // 어떤 코드인지 모름
요청사항 반영               // 어떤 요청을 어떻게 반영했는지 모름
Feat: CodeController 변경  // 무엇을 어떻게 변경했는지 모름
```

**이유**: "수정", "정리" 류는 `git log` / `git blame` 추적 시 가치가 0 이다.

### 동사 — 작업 성격에 맞게

| 성격 | 동사 |
|---|---|
| 신규 | **추가** |
| 버그·누락 | **보완**, **수정** |
| 구조 개선 | **이관**, **통일**, **정리**, **분리** |
| 제거 | **삭제** |
| 값·설정 바뀜 | **갱신** |

❌ **`변경` 단독 사용 금지** — 어떤 방향의 변경인지 알 수 없다.

### ⛔ `Co-Authored-By` 를 붙이지 않는다

**커밋 주체는 사용자다.** `Co-Authored-By: Claude ...` 같은 trailer 를
**어떤 경우에도 커밋 메시지에 넣지 않는다.** (도구 기본 지침보다 이 규칙이 우선)

### 커밋 절차

1. `git status` / `git diff` 로 **대상을 먼저 확인**한다 (조회는 항상 허용)
2. `git add` 는 **경로를 명시**한다. `git add -A` / `git add .` 는 쓰지 않는다
   — 의도하지 않은 파일이 섞이는 사고를 막는다
3. **비밀이 들어갈 수 있는 파일이 포함됐는지 확인**한다
   (`application-local.yml`, `.env` 등. gitignore 되어 있어도 눈으로 확인)
4. **한 커밋 = 한 가지 변경 성격.** 성격이 다른 변경이 섞여 있으면
   **쪼갤지 사용자에게 먼저 묻는다** (기능 추가 / 버그 수정 / 리팩토링 / 문서는 따로)

### 예시

```
Feat: 스니펫 디스패처와 Map 빈 자동주입 골격 추가

CodeSnippet 인터페이스 + Map<String, CodeSnippet> 주입으로 원본의 19갈래 switch 를 제거했다.
snippets.keys 가 /code/list 이므로 키워드 목록이 어긋날 수 없다.
```

```
Docs: kotlin-spring-port spec 에 컨벤션 이탈 2건 기록
```

> 마이그레이션 커밋 규칙(lawform `commit.md` §5 — `Prefix(db): … (V00)`, 스키마·코드 커밋 분리,
> Expand-Contract 단계별 분리)은 **Flyway 를 도입하는 2차에** 가져온다.

## 🟡 허락 필요 — 코드/설정 변경

아래처럼 **작업 트리·이력을 변경하거나 설정을 바꾸는** 명령은, 실행 전에 **사용자에게 허락을 받거나**,
**사용자에게 직접 실행해 달라고 요청**한다. (임의 실행 금지)

- `git pull`
- `git reset`
- `git remote` (add/remove/set-url 등 변경)
- `git checkout` / `git switch` / `git restore` (파일·브랜치 변경)
- `git rebase`, `git stash`, `git clean`, `git config` 등 상태/설정을 바꾸는 명령
- `git rm --cached` (인덱스 변경)

## 🟢 항상 허용 — 조회 / 비교

읽기 전용으로 **현재/이전 내용을 확인·비교**하는 명령은 **언제나** 실행해도 된다.

- `git log`
- `git diff`
- `git status`, `git show`, `git branch` (목록), `git remote -v` (조회) 등 상태를 바꾸지 않는 조회

## 원칙

- **커밋은 허용, 원격 반영은 금지.** 로컬 이력까지는 Claude 가 만들고, 밖으로 나가는 건 사용자가 결정한다
- 애매하면 **원격에 나가는가?** 로 판단 → 나가면 금지, 로컬이면 위 등급대로
- 커밋 메시지에 **`Co-Authored-By` 를 절대 넣지 않는다** (위 ⛔ 항목)

> 이 규칙은 확장될 예정 — 추후 DB, Redis 등 기능이 추가되면 관련 룰이 여기 `rule/` 에 추가된다.
