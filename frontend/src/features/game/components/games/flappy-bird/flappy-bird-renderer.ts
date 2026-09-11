import {
    FLAPPY_BIRD_SIZE,
    FLAPPY_BIRD_X,
    FLAPPY_CANVAS_HEIGHT,
    FLAPPY_CANVAS_WIDTH,
    FLAPPY_PIPE_WIDTH,
    getFlappyPipeGeometry,
    type FlappyGameState
} from "./flappy-bird-logic";

export function drawFlappyGame(context: CanvasRenderingContext2D, game: FlappyGameState, isDark: boolean): void
{
    context.clearRect(0, 0, FLAPPY_CANVAS_WIDTH, FLAPPY_CANVAS_HEIGHT);
    context.fillStyle = isDark ? "#0f172a" : "#ffffff";
    context.fillRect(0, 0, FLAPPY_CANVAS_WIDTH, FLAPPY_CANVAS_HEIGHT);
    context.fillStyle = isDark ? "#4ade80" : "#22c55e";

    game.pipes.forEach((pipe) =>
    {
        const { top, bottom } = getFlappyPipeGeometry(pipe);
        context.fillRect(pipe.x, 0, FLAPPY_PIPE_WIDTH, top);
        context.fillRect(pipe.x, bottom, FLAPPY_PIPE_WIDTH, FLAPPY_CANVAS_HEIGHT - bottom);
    });

    context.fillStyle = "#f59e0b";
    context.fillRect(FLAPPY_BIRD_X, game.birdY, FLAPPY_BIRD_SIZE, FLAPPY_BIRD_SIZE);
    context.fillStyle = isDark ? "#e0e6ed" : "#111827";
    context.font = "bold 32px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillText(`${game.score}`, FLAPPY_CANVAS_WIDTH / 2, 20);
}
