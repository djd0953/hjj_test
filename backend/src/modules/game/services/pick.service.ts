import { Injectable } from "@nestjs/common";

type PickDto = { n: string; w: number };

const rewards: PickDto[] = [
    { n: "C", w: 70 },
    { n: "B", w: 20 },
    { n: "A", w: 9 },
    { n: "S", w: 1 }
];

@Injectable()
export class PickService {
    constructor() {}

    private pick(items: PickDto[]): PickDto {
        const totalWeight = items.reduce((sum, item) => sum + item.w, 0);

        const random = Math.random() * totalWeight;

        let accumulatedWeight = 0;

        for (const item of items) {
            accumulatedWeight += item.w;

            if (random < accumulatedWeight) {
                return item;
            }
        }

        return items[items.length - 1];
    }

    p() {
        const result = this.pick(rewards);
        return result.n;
    }
}
