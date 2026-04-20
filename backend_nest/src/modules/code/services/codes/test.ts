import { Logger } from '@nestjs/common';

const logger = new Logger('CodeTest');

export const test = async () => {
    const playerCount = 2;
    const deckCount = 1;
    const cardCount = 52;

    const a: number[] = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3];
    const b = a.reduce((acc, v) => acc + v, 0);

    logger.verbose(b);
    return null;
};
