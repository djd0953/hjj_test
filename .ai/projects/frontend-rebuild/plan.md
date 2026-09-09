# frontend-rebuild — Plan (지시서)

## 아이콘 전용 테마 토글 크기 조정

사용자가 `theme-toggle.tsx`에서 테마 텍스트를 제거했고, `sidebar-layout.tsx`에서 로그인 메뉴와 토글의 순서를 직접 조정했다. 이 두 수정은 유지한다.

`frontend/src/app/globals.css`의 `.header-theme-button`만 아래처럼 아이콘 버튼 규격으로 바꾼다.

```css
.header-theme-button {
    display: inline-flex;
    width: 2.375rem;
    height: 2.375rem;
    align-items: center;
    justify-content: center;
    border: 1px solid #dbe3ef;
    border-radius: 0.5rem;
    padding: 0;
    /* 기존 background, color, cursor 유지 */
}
```

- 기존 `min-width: 5.75rem`, `gap`, `font-size`, `font-weight`를 제거한다. 텍스트가 없으므로 버튼 너비를 강제할 이유가 없다.
- `header-theme-button-placeholder`의 별도 `min-height`도 제거한다. 마운트 전 placeholder가 같은 `.header-theme-button` 규격을 이미 상속해 hydration 전후 크기가 동일하다.
- hover·focus-visible·dark 색상은 그대로 둔다.

적용 뒤 `pnpm --dir frontend lint`로 CSS와 TSX 정합성을 확인한다.
