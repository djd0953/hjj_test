# frontend-rebuild — Spec

## 배경

기존 `frontend/`는 Next.js Pages Router 기반의 NestJS 개발 도구(API Playground, Socket 로그, 게임 모음)다.
백엔드는 새 `backend-kt/` Kotlin Spring 애플리케이션으로 전환 중이며 HTTP 포트는 `9100`이다.
새 서비스 UI를 시작하기 좋은 시점이므로, 기존 프론트를 점진 보수하지 않고 App Router와 feature-first 구조로 재구축한다.

## 목적 / 완료 기준

1. Next.js App Router를 `frontend/src/app`에서 단일 라우터로 사용한다.
2. 개발·실행·Docker 공개 포트를 모두 `9000`으로 통일한다.
3. 도메인 기능은 `src/features`, 도메인 비의존 UI는 `src/components`, 외부 통신 기반은 `src/lib`에 둔다.
4. Spring API `http://localhost:9100`과 쿠키 인증을 위한 공통 API 클라이언트를 둔다.
5. 현재 Spring에서 실제 제공하는 로그인과 Code 스니펫 탐색 화면을 최소 기능으로 연결한다.

## 설계 방향

- `pages/`는 App Router와 충돌하므로 제거한다. 기존 게임, HSAD mock, Nest 전용 Playground/Socket 콘솔은 새 Spring API 범위 밖이므로 이 재구축에 이식하지 않는다. 필요하면 Git 이력에서 되살리거나 별도 feature로 다시 설계한다.
- 라우팅 파일은 URL, 메타데이터, layout 조합만 담당하고 실제 화면 구현은 feature에 둔다.
- 초기 feature는 `auth`, `code`만 만든다. `document`, `writing`, `user` 등은 실제 API·업무 요구가 생길 때 추가한다.
- API 공통 클라이언트는 `credentials: "include"`를 기본으로 하며, API origin은 `NEXT_PUBLIC_API_ORIGIN` 또는 개발 기본값 `http://localhost:9100`을 사용한다.
- Spring 서버는 `http://localhost:9000`을 credential CORS origin으로 허용해야 한다. 이 설정은 backend-kt 작업 범위다.
- feature 사이 직접 import는 하지 않는다. 페이지가 feature를 조합하고, 재사용 가능하며 도메인을 모르는 코드만 공통 영역으로 승격한다.

## 참조 파일

- `ref/frontend-architecture-gpt.md` — 사용자와 GPT가 논의한 장기 구조 초안
- `.ai/memory/architecture/frontend.md` — 기존 Next.js 프론트 구조
- `.ai/projects/kotlin-spring-port/spec.md` — Spring API 포트·인증·Code API 계약

## 기타 참조사항

- 이 작업의 코드 직접 반영은 사용자의 2026-09-03 승인("플랜 적용해줘")으로 시작했다.
- 이후 기능 추가는 사용자가 직접 구현한다. 이 작업은 기반 구조와 현재 Spring API의 최소 연결까지만 다룬다.
