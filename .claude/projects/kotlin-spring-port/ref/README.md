# ref/ — 참고 자료

`plan.md` 는 스텝마다 비워지므로, 거기서 나온 **오래 쓸 지식**은 이쪽으로 옮긴다.
(원래 이 폴더는 사용자가 직접 넣는 참고 파일 자리였다 — 2026-08-26 부터 지식 노트도 함께 둔다)

| 파일 | 내용 | 나온 단계 |
|---|---|---|
| [`aes-gcm.md`](aes-gcm.md) | GCM 이 하는 두 가지 일 / IV·태그에 뭐가 들어가나 / IV 재사용이 무너지는 두 단계 / `TokenCipher` 라인별 근거 | 4단계 Step 2 |
| [`GcmDemo.java`](GcmDemo.java) | 위 내용을 직접 돌려보는 실험 코드 (JDK 21 단일 파일) | 4단계 Step 2 |
| [`jackson3-kotlin.md`](jackson3-kotlin.md) | Boot 4 = Jackson 3(`tools.jackson`), Kotlin 모듈 없이 되는 이유와 그 대가 | 4단계 Step 4 |
| [`spring-web-auth.md`](spring-web-auth.md) | 미들웨어 3계층 / 인증·인가 분리 / 쿠키 옵션 / 존재 여부 oracle | 4단계 Step 4~6 |

**설계 결정 자체는 여기가 아니라 `spec.md`** 에 남긴다. 여기는 "왜 그렇게 동작하는가" 쪽이다.
