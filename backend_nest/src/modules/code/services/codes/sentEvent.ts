import { Observable } from "rxjs";

export interface SseMessageEvent {
    data: string | object;
}

export const sentEvent = (): Observable<SseMessageEvent> => {
    return new Observable((subscriber) => {
        let i = 1;
        const intervalId = setInterval(() => {
            if (i < 10) {
                subscriber.next({ data: { percent: i * 10, done: false } });
            } else {
                clearInterval(intervalId);
                subscriber.next({ data: { percent: 100, done: true } });
                subscriber.complete();
            }
            i++;
        }, 100);

        return () => clearInterval(intervalId);
    });
};
