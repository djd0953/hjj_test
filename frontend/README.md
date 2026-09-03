# Frontend

Next.js App Router 기반의 새 Spring API 프론트엔드다.

```bash
cd frontend
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

개발 서버는 `http://localhost:9000`에서 실행된다. 기본 API 대상은
`http://localhost:9100`이며, 필요하면 `.env.example`을 복사해
`NEXT_PUBLIC_API_ORIGIN`으로 바꾼다.
