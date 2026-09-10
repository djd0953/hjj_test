export const SNAKE_CANVAS_WIDTH = 640;
export const SNAKE_CANVAS_HEIGHT = 480;
export const SNAKE_CELL_SIZE = 20;
export const SNAKE_COLUMNS = SNAKE_CANVAS_WIDTH / SNAKE_CELL_SIZE;
export const SNAKE_ROWS = SNAKE_CANVAS_HEIGHT / SNAKE_CELL_SIZE;

const KOREAN_KEY_MAP: Record<string, string> = {
    "ㅈ": "w",
    "ㄴ": "s",
    "ㅁ": "a",
    "ㅇ": "d",
    "ㅉ": "W"
};

export type SnakeDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type SnakeStatus = "idle" | "playing" | "over";

export interface SnakePoint
{
    x: number;
    y: number;
}

export function createInitialSnake(): SnakePoint[]
{
    const startX = Math.floor(SNAKE_COLUMNS / 2);
    const startY = Math.floor(SNAKE_ROWS / 2);

    return [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
}

export function createFood(snake: SnakePoint[]): SnakePoint
{
    let food: SnakePoint;

    do
    {
        food = {
            x: Math.floor(Math.random() * SNAKE_COLUMNS),
            y: Math.floor(Math.random() * SNAKE_ROWS)
        };
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));

    return food;
}

export function getSnakeSpeed(score: number): number
{
    return 100 - Math.min(score * 2, 60);
}

export function getQueuedDirection(key: string, currentDirection: SnakeDirection): SnakeDirection | null
{
    const normalizedKey = KOREAN_KEY_MAP[key] ?? key;

    switch (normalizedKey)
    {
        case "ArrowUp":
        case "w":
        case "W":
            return currentDirection === "DOWN" ? null : "UP";
        case "ArrowDown":
        case "s":
        case "S":
            return currentDirection === "UP" ? null : "DOWN";
        case "ArrowLeft":
        case "a":
        case "A":
            return currentDirection === "RIGHT" ? null : "LEFT";
        case "ArrowRight":
        case "d":
        case "D":
            return currentDirection === "LEFT" ? null : "RIGHT";
        default:
            return null;
    }
}

export function moveSnake(snake: SnakePoint[], direction: SnakeDirection, food: SnakePoint): {
    ateFood: boolean;
    isGameOver: boolean;
    snake: SnakePoint[];
}
{
    const head = snake[0];
    const nextHead = { ...head };

    switch (direction)
    {
        case "UP": nextHead.y -= 1; break;
        case "DOWN": nextHead.y += 1; break;
        case "LEFT": nextHead.x -= 1; break;
        case "RIGHT": nextHead.x += 1; break;
    }

    const hitWall = nextHead.x < 0 || nextHead.x >= SNAKE_COLUMNS || nextHead.y < 0 || nextHead.y >= SNAKE_ROWS;
    const hitSelf = snake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

    if (hitWall || hitSelf)
        return { ateFood: false, isGameOver: true, snake };

    const ateFood = nextHead.x === food.x && nextHead.y === food.y;
    const nextSnake = [nextHead, ...snake];

    if (!ateFood)
        nextSnake.pop();

    return { ateFood, isGameOver: false, snake: nextSnake };
}
