export const FLAPPY_CANVAS_WIDTH = 640;
export const FLAPPY_CANVAS_HEIGHT = 480;
export const FLAPPY_BIRD_SIZE = 20;
export const FLAPPY_BIRD_X = 80;

const GRAVITY = 0.25;
const FLAP_STRENGTH = -6;
const PIPE_WIDTH = 50;
const PIPE_GAP = 140;
const PIPE_SPEED = 3;
const PIPE_SPAWN_DISTANCE = 220;

export type FlappyStatus = "idle" | "running" | "gameover";

export type FlappyPipe = { gapY: number; passed: boolean; x: number };
export type FlappyGameState = { birdVel: number; birdY: number; frameDistance: number; pipes: FlappyPipe[]; score: number };

export function createInitialFlappyGame(): FlappyGameState
{
    return { birdY: FLAPPY_CANVAS_HEIGHT / 2 - FLAPPY_BIRD_SIZE / 2, birdVel: 0, pipes: [], score: 0, frameDistance: 0 };
}

export function resetFlappyGame(game: FlappyGameState): void
{
    Object.assign(game, createInitialFlappyGame());
}

export function advanceFlappyGame(game: FlappyGameState, shouldFlap: boolean): boolean
{
    if (shouldFlap)
        game.birdVel = FLAP_STRENGTH;

    game.birdVel += GRAVITY;
    game.birdY += game.birdVel;
    game.frameDistance += PIPE_SPEED;

    if (game.frameDistance >= PIPE_SPAWN_DISTANCE)
    {
        game.frameDistance = 0;
        const minGapY = PIPE_GAP / 2 + 20;
        const maxGapY = FLAPPY_CANVAS_HEIGHT - PIPE_GAP / 2 - 20;
        game.pipes.push({ x: FLAPPY_CANVAS_WIDTH, gapY: minGapY + Math.random() * (maxGapY - minGapY), passed: false });
    }

    game.pipes.forEach((pipe) => { pipe.x -= PIPE_SPEED; });
    game.pipes.forEach((pipe) =>
    {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < FLAPPY_BIRD_X)
        {
            pipe.passed = true;
            game.score += 1;
        }
    });
    game.pipes = game.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -10);

    if (game.birdY < 0 || game.birdY + FLAPPY_BIRD_SIZE > FLAPPY_CANVAS_HEIGHT)
        return true;

    return game.pipes.some((pipe) =>
    {
        const overlapsHorizontally = FLAPPY_BIRD_X + FLAPPY_BIRD_SIZE > pipe.x && FLAPPY_BIRD_X < pipe.x + PIPE_WIDTH;
        const isOutsideGap = game.birdY < pipe.gapY - PIPE_GAP / 2 || game.birdY + FLAPPY_BIRD_SIZE > pipe.gapY + PIPE_GAP / 2;
        return overlapsHorizontally && isOutsideGap;
    });
}

export function getFlappyPipeGeometry(pipe: FlappyPipe): { bottom: number; top: number }
{
    return { top: pipe.gapY - PIPE_GAP / 2, bottom: pipe.gapY + PIPE_GAP / 2 };
}

export { PIPE_WIDTH as FLAPPY_PIPE_WIDTH };
