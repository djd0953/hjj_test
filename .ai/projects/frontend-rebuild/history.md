# frontend-rebuild — History

> 날짜별 진행 요약. 새 세션에서 작업을 이어가기 위한 기록.

## 2026-09-03
- 작업 시작. 기존 Next.js Pages Router/NestJS 개발 도구를 App Router/feature-first 구조로 재구축하기로 했고, 프론트 포트는 9000, Spring API 포트는 9100으로 확정했다.
- 기존 Pages Router·게임·Nest 전용 화면을 제거하고 `src/app` 기반 App Router를 만들었다. `npm run dev`·`npm start`·Docker·docker-compose 포트를 9000으로 통일했고 production build를 통과했다.
