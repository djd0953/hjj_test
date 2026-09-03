# frontend-rebuild — Request (열린 항목)

> 결정이 필요하거나, 애매해서 질문으로 풀어야 하는 항목.

- [ ] Spring 서버의 credential CORS 설정에 `http://localhost:9000`을 반영해야 한다. backend-kt 작업에서 확인한다.
- [ ] `CodeRunResponse.elapsedMs`는 Spring 구현에서 마이크로초 값을 담는다. 백엔드가 필드명 또는 단위를 정리하면 프론트 결과 화면의 표기를 확정한다.
- [ ] 기존 Nest용 `Dockerfile.dev`, `Dockerfile.prod`, `docker-compose.yml`은 삭제된 루트 `package.json`을 참조해 현재 실행할 수 없다. legacy Docker를 제거할지, frontend·backend-kt 기준으로 새로 구성할지 결정한다.
