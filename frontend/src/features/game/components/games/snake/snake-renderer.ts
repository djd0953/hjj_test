import {
    SNAKE_CANVAS_HEIGHT,
    SNAKE_CANVAS_WIDTH,
    SNAKE_CELL_SIZE,
    SNAKE_COLUMNS,
    SNAKE_ROWS,
    type SnakePoint
} from "./snake-logic";

export function drawSnakeGame(context: CanvasRenderingContext2D, options: {
    food: SnakePoint;
    isDark: boolean;
    score: number;
    snake: SnakePoint[];
}): void
{
    const { food, isDark, score, snake } = options;
    const backgroundColor = isDark ? "#0f172a" : "#ffffff";
    const textColor = isDark ? "#e0e6ed" : "#111827";
    const snakeColor = isDark ? "#22d3ee" : "#2563eb";
    const snakeHeadColor = isDark ? "#67e8f9" : "#1d4ed8";
    const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, SNAKE_CANVAS_WIDTH, SNAKE_CANVAS_HEIGHT);
    context.strokeStyle = gridColor;
    context.lineWidth = 1;

    for (let x = 0; x <= SNAKE_COLUMNS; x++)
    {
        context.beginPath();
        context.moveTo(x * SNAKE_CELL_SIZE, 0);
        context.lineTo(x * SNAKE_CELL_SIZE, SNAKE_CANVAS_HEIGHT);
        context.stroke();
    }

    for (let y = 0; y <= SNAKE_ROWS; y++)
    {
        context.beginPath();
        context.moveTo(0, y * SNAKE_CELL_SIZE);
        context.lineTo(SNAKE_CANVAS_WIDTH, y * SNAKE_CELL_SIZE);
        context.stroke();
    }

    context.fillStyle = "#22c55e";
    context.fillRect(food.x * SNAKE_CELL_SIZE + 1, food.y * SNAKE_CELL_SIZE + 1, SNAKE_CELL_SIZE - 2, SNAKE_CELL_SIZE - 2);

    snake.forEach((segment, index) =>
    {
        context.fillStyle = index === 0 ? snakeHeadColor : snakeColor;
        context.fillRect(segment.x * SNAKE_CELL_SIZE + 1, segment.y * SNAKE_CELL_SIZE + 1, SNAKE_CELL_SIZE - 2, SNAKE_CELL_SIZE - 2);
    });

    context.fillStyle = textColor;
    context.font = "16px monospace";
    context.textAlign = "left";
    context.fillText(`Score: ${score}`, 10, 22);
}

export function drawSnakeIdle(context: CanvasRenderingContext2D, isDark: boolean): void
{
    context.fillStyle = isDark ? "#0f172a" : "#ffffff";
    context.fillRect(0, 0, SNAKE_CANVAS_WIDTH, SNAKE_CANVAS_HEIGHT);
    context.fillStyle = isDark ? "#e0e6ed" : "#111827";
    context.font = "24px monospace";
    context.textAlign = "center";
    context.fillText("Snake Game", SNAKE_CANVAS_WIDTH / 2, SNAKE_CANVAS_HEIGHT / 2 - 10);
    context.font = "14px monospace";
    context.fillText("Press Start to play", SNAKE_CANVAS_WIDTH / 2, SNAKE_CANVAS_HEIGHT / 2 + 20);
}
