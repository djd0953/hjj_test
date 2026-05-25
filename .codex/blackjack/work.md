# NestJS + Socket.IO 구조 정리 메모

## 현재 방향

기존 `ws` 기반 구조를 `socket.io` 기반으로 변경 중.

목표:

```text
Gateway = 통신 담당
Service = 상태/게임 로직 담당
```

---

# Socket.IO 사용 이유

기존 `ws` 대비 장점:

* 이벤트 기반 (`@SubscribeMessage`)
* room 기능 내장
* reconnect 지원
* emit 구조 단순화
* 특정 유저 전송 편리
* middleware/JWT 인증 편리
* Redis adapter 확장 용이

예:

```ts
socket.emit("hit");
socket.emit("bet", { amount: 100 });
```

```ts
@SubscribeMessage("hit")
handleHit()
```

---

# 현재 구조 방향

## Gateway

역할:

* socket 연결 관리
* socket.io room join/leave
* client emit / broadcast
* DTO 검증
* try/catch 처리
* service 호출

## Service

역할:

* room 상태 관리
* player/spectator 관리
* 게임 로직
* betting/turn/dealer 처리
* 상태 반환

---

# 중요한 구조 원칙

## Service는 socket 객체를 몰라야 함

좋은 예:

```ts
joinRoom(roomId, clientId)
```

안 좋은 예:

```ts
joinRoom(socket)
```

---

# Socket.IO Room

socket.io room은 "네트워크 그룹"

```text
roomId
 ├─ player
 └─ spectator
```

게임 상태 자체는 Service가 관리.

---

# 현재 수정 방향

## 기존

```ts
@SubscribeMessage("message")
handleMessage() {
    switch (msg.type)
}
```

## 변경 예정

```ts
@SubscribeMessage("room:join")
@SubscribeMessage("bet")
@SubscribeMessage("hit")
@SubscribeMessage("stand")
@SubscribeMessage("double")
@SubscribeMessage("split")
```

Gateway에서 이벤트 단위 분리.

---

# client.join(roomId) 관련

## 반드시 await 사용

```ts
await client.join(roomId);
```

이유:

* socket.io adapter는 Promise 반환
* Redis adapter 환경 고려
* join 완료 전 broadcast 가능성 방지

---

# join 순서 주의

현재 문제:

```ts
await client.join(roomId);
this.wsService.joinRoom(...)
```

service에서 throw되면 socket은 이미 room 입장 완료 상태.

---

# 추천 구조

```text
1. room 존재 검증
2. socket room join
3. service 상태 변경
4. broadcast
```

예:

```ts
this.wsService.assertRoomExists(roomId);

await client.join(roomId);

const player = this.wsService.joinRoom(roomId, client.id);

this.broadcast(roomId, "player:join", player);
```

---

# rollback 처리

join 후 service 에러 발생 시:

```ts
await client.leave(roomId);
```

필요 가능.

예:

```ts
let joinedRoomId: string | null = null;

try {
    await client.join(roomId);
    joinedRoomId = roomId;

    this.wsService.joinRoom(roomId, client.id);
} catch (e) {
    if (joinedRoomId) {
        await client.leave(joinedRoomId).catch(() => undefined);
    }
}
```

---

# WsException 처리

## websocket은 HTTP처럼 자동 응답 구조가 아님

추천:

* 서버 내부 버그 → throw
* 사용자 입력 오류 → emit

---

# 추천 error 처리

```ts
private handleError(clientId: string, e: unknown) {
    if (e instanceof WsException) {
        const error = e.getError();
        const message =
            typeof error === "string"
                ? error
                : "websocket error";

        this.sendToError(clientId, message);
        return;
    }

    this.logger.error(e);
    this.sendToError(clientId, "internal server error");
}
```

---

# "error" 이벤트명 주의

추천하지 않음:

```ts
emit("error")
```

추천:

```ts
emit("server:error")
```

---

# socket.io room 관련 핵심 실수

현재 가장 중요했던 문제:

```ts
this.server.to(roomId).emit(...)
```

했지만 실제로:

```ts
client.join(roomId)
```

를 안 해서 아무도 room에 없던 상태 가능성 존재.

---

# 현재 코드에서 수정 필요했던 부분

## room:create

현재:

```ts
createRoom()
→ service.createRoom()
→ service.joinRoom()
```

문제:

```ts
client.join(room.id)
```

누락.

반드시 추가 필요.

---

# joinRoom 버그

기존 코드:

```ts
if (this.canJoinAsPlayer(room)) {
    room.players.set(...)
}

player.spectating = true;
room.spectators.set(...)
```

문제:

* player
* spectator

둘 다 들어감.

해결:

```ts
return;
```

추가 필요.

---

# getOrThrowRoom 문제

현재 이름:

```ts
getOrThrowRoom()
```

실제 동작:

```ts
return null;
```

권장:

```ts
getRoom()
```

또는 실제 throw 구현.

---

# Map 직렬화 주의

socket emit에 Map 직접 전달 위험.

예:

```ts
Map
Iterator
```

직접 emit 비추천.

반드시 DTO/배열 변환 추천.

예:

```ts
[...rooms.values()].map(...)
```

---

# 추천 이벤트명

```text
room:create
room:join
room:leave
room:list

player:join
player:left

room:state

server:error
```

---

# namespace

현재:

```ts
@WebSocketGateway({
    namespace: "ws"
})
```

프론트:

```ts
io("http://localhost:9090/ws")
```

형태로 연결.

---

# VSCode 이슈 메모

`TypeScript: Restart TS Server` 명령이 없던 문제는:

* macOS profile sync
* extension/settings 충돌

원인 가능성 높음.

Empty Profile에서는 정상 동작 확인됨.

---

# 타입 관련

## socket.io는 자체 타입 제공

제거 필요:

```bash
npm uninstall @types/socket.io
```

---

# 현재 추천 다음 단계

```text
1. room join/leave 안정화
2. room state serializer 작성
3. player/spectator 상태 정리
4. disconnect 처리
5. room:state emit 구조 만들기
6. betting/hit/stand 이벤트 분리
7. frontend socket.io-client 연결
```
