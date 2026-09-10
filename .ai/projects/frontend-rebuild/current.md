# frontend-rebuild — Current (진행 체크리스트)

> 사용자용 작업 리스트. 완료 항목은 삭제하지 않고 체크만 한다.

## 할 일

- [ ] 1. 작업 문서·참조 아키텍처를 기록하고 재구축 범위를 확정
- [x] 2. Pages Router를 App Router로 교체하고 포트 9000을 전 구동 경로에 통일
- [x] 3. feature-first 폴더, 공통 레이아웃·UI 기반, import alias를 구성
- [x] 4. Spring API 클라이언트·로그인·Code 스니펫 탐색 feature를 연결
- [x] 5. production build로 App Router·타입 정합성을 확인하고 문서 상태를 마무리
- [x] 6. frontend 의존성 관리자를 npm에서 pnpm으로 전환하고 Docker·문서를 정합화
- [x] 7. frontend ESLint 설정·의존성을 독립시켜 루트 Node 도구 의존성을 제거할 준비
- [x] 8. 퇴역한 루트 Node·VS Code·Claude MCP 설정을 제거하고 공용 메모리를 정합화
- [x] 9. `/auth/me` 기반 로그인 상태를 공통 헤더에 반영
- [x] 10. Code 메뉴를 반응형 좌측 사이드바로 이동
- [x] 11. 햄버거·접기 버튼으로 좌측 사이드바를 토글
- [x] 12. 접힌 사이드바의 빠른 메뉴와 확장 동작을 분리
- [x] 13. App Router 기반 Game Hub와 로컬 게임을 단계적으로 복원
- [x] 14. 헤더 우측에 인증 메뉴와 전역 밝음/어두움 테마 토글 구성
- [x] 15. 내부 UI 토큰·공통 컴포넌트와 Code 스니펫 Table을 구성하고 화면 인상 개선
- [x] 16. 페이지 제목 크기와 접힌 사이드바의 hover 확장 내비게이션 보완
- [x] 17. Game Hub 선택기를 compact flex 버튼 묶음으로 축소하고 hover 내비게이션 이벤트 보완
- [x] 18. hover 확장 중 사이드바 열기 버튼과 메뉴의 겹침 보완
- [x] 19. 햄버거에서 hover 메뉴로 이동할 때 닫힘 지연 처리 보완
- [x] 20. 접힌 사이드바를 햄버거 hover·클릭 기반의 단순 확장 동작으로 재구성
- [ ] 21. Canvas 기반 게임을 View·hook·logic·renderer 책임으로 분리
- [ ] 22. Blackjack과 Blackjack Online의 화면·게임 진행·Socket.IO 책임 분리
- [ ] 23. Pixi·Three 기반 게임의 Scene/게임 상태 책임 분리
