---
name: Blackjack Online WebSocket 작업 현황
description: 멀티플레이어 블랙잭 - BE WebSocket + FE Canvas 구현 진행 상황 및 남은 이슈
type: project
---

## 목표
기존 로컬 블랙잭(Blackjack.tsx)은 그대로 두고, BE에서 게임 로직을 처리하고 FE는 WebSocket으로 Canvas 렌더링하는 온라인 멀티플레이어 블랙잭 신규 구현

## 핵심 규칙
1. WS 연결 시 코인 1000 지급
2. settlement 상태 + 8명 미만 → 즉시 play 가능
3. 게임 진행 중 접속 → 관전 모드
4. 플레이 중 disconnect → 해당 턴에서 자동 stand

## 생성/수정된 파일
- `backend/src/ws/blackjack.ts` — 게임 룸 클래스 (덱, 딜러, 정산, 턴 관리)
- `backend/src/ws/index.ts` — WebSocket 서버 초기화 (경로: /ws/blackjack)
- `backend/src/app.ts` — http.createServer 래핑 + initWebSocket 연결
- `frontend/components/games/BlackjackOnline.tsx` — Canvas 렌더링 + WS 클라이언트
- `frontend/pages/game.tsx` — "블랙잭 (온라인)" 항목 추가
- `backend/package.json` — ws, @types/ws 설치됨

## 남은 이슈 (2026-04-08 기준)
`backend/src/ws/blackjack.ts` lint/ts 경고:
1. **Line 113** `handTotal` 함수 선언됐지만 미사용 → 제거하거나 `_handTotal`로 rename 또는 실제 사용처 연결
2. **Line 1** import 그룹 사이에 빈 줄 필요 (eslint)
3. **Line 203** catch의 `e` 파라미터 미사용 (eslint)

## 참고
- BE PORT 환경변수와 FE NEXT_PUBLIC_WS_PORT를 맞춰야 함 (예: 둘 다 4000)
- 아직 실제 실행 테스트는 안 함
