import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
    Application,
    Graphics,
    Text,
    TextStyle,
    Container,
    Ticker
} from 'pixi.js';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 24;
const PLAYER_SPEED = 300;
const BULLET_SPEED = 500;
const BULLET_COOLDOWN = 0.18;
const ENEMY_BASE_SPEED = 80;
const ENEMY_SPAWN_INTERVAL_START = 1.2;
const ENEMY_SPAWN_INTERVAL_MIN = 0.3;
const STAR_COUNT = 80;
const PARTICLE_LIFE = 0.5;

const KO_TO_EN: Record<string, string> = {
    'ㅈ': 'w', 'ㄴ': 's', 'ㅁ': 'a', 'ㅇ': 'd'
};

function normalizeKey(key: string): string
{
    if (key.length === 1)
    {
        const lower = key.toLowerCase();
        return KO_TO_EN[lower] ?? lower;
    }
    return key;
}

type Vec2 = { x: number; y: number };

interface Bullet
{
    gfx: Graphics;
    vel: Vec2;
}

interface Enemy
{
    gfx: Graphics;
    hp: number;
    vel: Vec2;
    width: number;
    height: number;
    kind: 'normal' | 'fast' | 'tank';
}

interface Star
{
    gfx: Graphics;
    speed: number;
}

interface Particle
{
    gfx: Graphics;
    vel: Vec2;
    life: number;
}

interface PowerUp
{
    gfx: Graphics;
    kind: 'spread' | 'rapid' | 'shield';
    speed: number;
}

type GameStatus = 'idle' | 'playing' | 'over';

export default function SpaceShooter()
{
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(false);

    const [status, setStatus] = useState<GameStatus>('idle');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const statusRef = useRef<GameStatus>('idle');
    const scoreRef = useRef(0);
    const keysRef = useRef<Record<string, boolean>>({});

    // Game objects refs
    const playerRef = useRef<Graphics | null>(null);
    const bulletsRef = useRef<Bullet[]>([]);
    const enemiesRef = useRef<Enemy[]>([]);
    const starsRef = useRef<Star[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const powerUpsRef = useRef<PowerUp[]>([]);

    const gameContainerRef = useRef<Container | null>(null);
    const uiContainerRef = useRef<Container | null>(null);
    const scoreTextRef = useRef<Text | null>(null);
    const overlayRef = useRef<Container | null>(null);

    // Game state
    const spawnTimerRef = useRef(0);
    const bulletTimerRef = useRef(0);
    const elapsedRef = useRef(0);
    const shieldRef = useRef(false);
    const shieldTimerRef = useRef(0);
    const spreadRef = useRef(false);
    const spreadTimerRef = useRef(0);
    const rapidRef = useRef(false);
    const rapidTimerRef = useRef(0);
    const tickerCallbackRef = useRef<((ticker: Ticker) => void) | null>(null);

    useEffect(() =>
    {
        isDarkRef.current = resolvedTheme === 'dark';
    }, [resolvedTheme]);

    // Keyboard
    useEffect(() =>
    {
        const onDown = (e: KeyboardEvent) =>
        {
            const key = normalizeKey(e.key);
            keysRef.current[key] = true;

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key))
            {
                e.preventDefault();
            }
        };

        const onUp = (e: KeyboardEvent) =>
        {
            const key = normalizeKey(e.key);
            keysRef.current[key] = false;
        };

        const onBlur = () => { keysRef.current = {}; };

        window.addEventListener('keydown', onDown, { passive: false });
        window.addEventListener('keyup', onUp);
        window.addEventListener('blur', onBlur);

        return () =>
        {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    const drawPlayer = useCallback((gfx: Graphics, dark: boolean) =>
    {
        gfx.clear();
        const color = dark ? 0x60a5fa : 0x2563eb;
        // Ship body
        gfx.poly([
            { x: 0, y: -PLAYER_HEIGHT / 2 },
            { x: -PLAYER_WIDTH / 2, y: PLAYER_HEIGHT / 2 },
            { x: 0, y: PLAYER_HEIGHT / 4 },
            { x: PLAYER_WIDTH / 2, y: PLAYER_HEIGHT / 2 }
        ]);
        gfx.fill(color);

        // Engine glow
        gfx.poly([
            { x: -6, y: PLAYER_HEIGHT / 2 },
            { x: 0, y: PLAYER_HEIGHT / 2 + 6 },
            { x: 6, y: PLAYER_HEIGHT / 2 }
        ]);
        gfx.fill(0xfbbf24);
    }, []);

    const spawnStars = useCallback((container: Container) =>
    {
        const stars: Star[] = [];
        for (let i = 0; i < STAR_COUNT; i++)
        {
            const gfx = new Graphics();
            const size = 1 + Math.random() * 2;
            const brightness = 0.3 + Math.random() * 0.7;
            const gray = Math.floor(brightness * 255);
            gfx.circle(0, 0, size);
            gfx.fill((gray << 16) | (gray << 8) | gray);
            gfx.x = Math.random() * CANVAS_WIDTH;
            gfx.y = Math.random() * CANVAS_HEIGHT;
            gfx.alpha = brightness;
            container.addChild(gfx);
            stars.push({ gfx, speed: 20 + Math.random() * 60 });
        }
        return stars;
    }, []);

    const spawnExplosion = useCallback((x: number, y: number, color: number, count: number) =>
    {
        const container = gameContainerRef.current;
        if (!container) return;

        for (let i = 0; i < count; i++)
        {
            const gfx = new Graphics();
            const size = 1.5 + Math.random() * 3;
            gfx.circle(0, 0, size);
            gfx.fill(color);
            gfx.x = x;
            gfx.y = y;
            container.addChild(gfx);

            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 180;
            particlesRef.current.push({
                gfx,
                vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                life: PARTICLE_LIFE
            });
        }
    }, []);

    const createEnemy = useCallback((elapsed: number): Enemy =>
    {
        const gfx = new Graphics();
        const roll = Math.random();
        let kind: Enemy['kind'] = 'normal';
        let hp = 1;
        let w = 24;
        let h = 20;
        let speed = ENEMY_BASE_SPEED + elapsed * 3;
        let color = 0xef4444;

        if (elapsed > 10 && roll < 0.25)
        {
            kind = 'fast';
            hp = 1;
            w = 18;
            h = 16;
            speed *= 1.8;
            color = 0xfbbf24;
        }
        else if (elapsed > 20 && roll < 0.15)
        {
            kind = 'tank';
            hp = 3;
            w = 34;
            h = 28;
            speed *= 0.6;
            color = 0xa855f7;
        }

        // Enemy shape (inverted triangle)
        gfx.poly([
            { x: 0, y: h / 2 },
            { x: -w / 2, y: -h / 2 },
            { x: w / 2, y: -h / 2 }
        ]);
        gfx.fill(color);

        gfx.x = 20 + Math.random() * (CANVAS_WIDTH - 40);
        gfx.y = -h;

        const vx = (Math.random() - 0.5) * 40;
        const vy = speed;

        return { gfx, hp, vel: { x: vx, y: vy }, width: w, height: h, kind };
    }, []);

    const createPowerUp = useCallback((): PowerUp =>
    {
        const gfx = new Graphics();
        const kinds: PowerUp['kind'][] = ['spread', 'rapid', 'shield'];
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const colors = { spread: 0x22d3ee, rapid: 0xfbbf24, shield: 0x22c55e };

        gfx.roundRect(-8, -8, 16, 16, 3);
        gfx.fill(colors[kind]);

        // Letter
        const label = kind === 'spread' ? 'S' : kind === 'rapid' ? 'R' : 'H';
        const text = new Text({
            text: label,
            style: new TextStyle({ fontSize: 11, fontWeight: 'bold', fill: '#000' })
        });
        text.anchor.set(0.5);
        gfx.addChild(text);

        gfx.x = 20 + Math.random() * (CANVAS_WIDTH - 40);
        gfx.y = -12;

        return { gfx, kind, speed: 60 + Math.random() * 40 };
    }, []);

    // Init PixiJS app
    useEffect(() =>
    {
        let destroyed = false;
        const initApp = async () =>
        {
            const app = new Application();
            await app.init({
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                backgroundColor: 0x0f172a,
                antialias: true
            });

            if (destroyed)
            {
                app.destroy(true);
                return;
            }

            appRef.current = app;
            const el = containerRef.current;
            if (el)
            {
                el.appendChild(app.canvas);
            }

            // Game container (stars, player, bullets, enemies, particles)
            const gameContainer = new Container();
            app.stage.addChild(gameContainer);
            gameContainerRef.current = gameContainer;

            // UI container
            const uiContainer = new Container();
            app.stage.addChild(uiContainer);
            uiContainerRef.current = uiContainer;

            // Score text
            const scoreText = new Text({
                text: 'Score: 0',
                style: new TextStyle({
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fill: '#e0e6ed'
                })
            });
            scoreText.x = 10;
            scoreText.y = 8;
            uiContainer.addChild(scoreText);
            scoreTextRef.current = scoreText;

            // Stars
            starsRef.current = spawnStars(gameContainer);

            // Overlay for idle / game over
            const overlay = new Container();
            app.stage.addChild(overlay);
            overlayRef.current = overlay;
            showIdleOverlay();
        };

        initApp();

        return () =>
        {
            destroyed = true;
            if (appRef.current)
            {
                if (tickerCallbackRef.current)
                {
                    appRef.current.ticker.remove(tickerCallbackRef.current);
                    tickerCallbackRef.current = null;
                }
                appRef.current.destroy(true, { children: true });
                appRef.current = null;
            }
        };
    }, []);

    const clearOverlay = useCallback(() =>
    {
        const overlay = overlayRef.current;
        if (overlay) overlay.removeChildren();
    }, []);

    const showIdleOverlay = useCallback(() =>
    {
        clearOverlay();
        const overlay = overlayRef.current;
        if (!overlay) return;

        const bg = new Graphics();
        bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        bg.fill({ color: 0x000000, alpha: 0.5 });
        overlay.addChild(bg);

        const title = new Text({
            text: 'Space Shooter',
            style: new TextStyle({ fontSize: 32, fontFamily: 'monospace', fill: '#ffffff', fontWeight: 'bold' })
        });
        title.anchor.set(0.5);
        title.x = CANVAS_WIDTH / 2;
        title.y = CANVAS_HEIGHT / 2 - 30;
        overlay.addChild(title);

        const hint = new Text({
            text: 'Press Start to play',
            style: new TextStyle({ fontSize: 14, fontFamily: 'monospace', fill: '#94a3b8' })
        });
        hint.anchor.set(0.5);
        hint.x = CANVAS_WIDTH / 2;
        hint.y = CANVAS_HEIGHT / 2 + 10;
        overlay.addChild(hint);
    }, [clearOverlay]);

    const showGameOverOverlay = useCallback(() =>
    {
        clearOverlay();
        const overlay = overlayRef.current;
        if (!overlay) return;

        const bg = new Graphics();
        bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        bg.fill({ color: 0x000000, alpha: 0.5 });
        overlay.addChild(bg);

        const title = new Text({
            text: 'Game Over',
            style: new TextStyle({ fontSize: 32, fontFamily: 'monospace', fill: '#ffffff', fontWeight: 'bold' })
        });
        title.anchor.set(0.5);
        title.x = CANVAS_WIDTH / 2;
        title.y = CANVAS_HEIGHT / 2 - 30;
        overlay.addChild(title);

        const scoreText = new Text({
            text: `Score: ${scoreRef.current}`,
            style: new TextStyle({ fontSize: 18, fontFamily: 'monospace', fill: '#e0e6ed' })
        });
        scoreText.anchor.set(0.5);
        scoreText.x = CANVAS_WIDTH / 2;
        scoreText.y = CANVAS_HEIGHT / 2 + 10;
        overlay.addChild(scoreText);
    }, [clearOverlay]);

    const cleanupGameObjects = useCallback(() =>
    {
        const container = gameContainerRef.current;
        if (!container) return;

        for (const b of bulletsRef.current)
        {
            container.removeChild(b.gfx);
            b.gfx.destroy();
        }
        bulletsRef.current = [];

        for (const e of enemiesRef.current)
        {
            container.removeChild(e.gfx);
            e.gfx.destroy();
        }
        enemiesRef.current = [];

        for (const p of particlesRef.current)
        {
            container.removeChild(p.gfx);
            p.gfx.destroy();
        }
        particlesRef.current = [];

        for (const pu of powerUpsRef.current)
        {
            container.removeChild(pu.gfx);
            pu.gfx.destroy();
        }
        powerUpsRef.current = [];

        if (playerRef.current)
        {
            container.removeChild(playerRef.current);
            playerRef.current.destroy();
            playerRef.current = null;
        }
    }, []);

    const fireBullet = useCallback((px: number, py: number) =>
    {
        const container = gameContainerRef.current;
        if (!container) return;

        const offsets = spreadRef.current
            ? [{ x: 0, y: -1 }, { x: -0.3, y: -0.95 }, { x: 0.3, y: -0.95 }]
            : [{ x: 0, y: -1 }];

        for (const dir of offsets)
        {
            const gfx = new Graphics();
            gfx.rect(-2, -5, 4, 10);
            gfx.fill(0x22d3ee);
            gfx.x = px;
            gfx.y = py - PLAYER_HEIGHT / 2;
            container.addChild(gfx);

            const len = Math.hypot(dir.x, dir.y);
            bulletsRef.current.push({
                gfx,
                vel: { x: (dir.x / len) * BULLET_SPEED, y: (dir.y / len) * BULLET_SPEED }
            });
        }
    }, []);

    const startGame = useCallback(() =>
    {
        const app = appRef.current;
        const container = gameContainerRef.current;
        if (!app || !container) return;

        // Remove old ticker
        if (tickerCallbackRef.current)
        {
            app.ticker.remove(tickerCallbackRef.current);
            tickerCallbackRef.current = null;
        }

        cleanupGameObjects();
        clearOverlay();

        // Reset state
        scoreRef.current = 0;
        setScore(0);
        spawnTimerRef.current = 0;
        bulletTimerRef.current = 0;
        elapsedRef.current = 0;
        shieldRef.current = false;
        shieldTimerRef.current = 0;
        spreadRef.current = false;
        spreadTimerRef.current = 0;
        rapidRef.current = false;
        rapidTimerRef.current = 0;
        keysRef.current = {};

        // Create player
        const player = new Graphics();
        drawPlayer(player, true);
        player.x = CANVAS_WIDTH / 2;
        player.y = CANVAS_HEIGHT - 60;
        container.addChild(player);
        playerRef.current = player;

        setStatus('playing');
        statusRef.current = 'playing';

        // Main game loop
        const gameLoop = (ticker: Ticker) =>
        {
            if (statusRef.current !== 'playing') return;

            const dt = ticker.deltaMS / 1000;
            elapsedRef.current += dt;
            const elapsed = elapsedRef.current;

            const keys = keysRef.current;
            const player = playerRef.current;
            if (!player) return;

            // Player movement
            const ix = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
            const iy = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
            const inputLen = Math.hypot(ix, iy) || 1;

            player.x += (ix / inputLen) * PLAYER_SPEED * dt;
            player.y += (iy / inputLen) * PLAYER_SPEED * dt;
            player.x = Math.max(PLAYER_WIDTH / 2, Math.min(CANVAS_WIDTH - PLAYER_WIDTH / 2, player.x));
            player.y = Math.max(PLAYER_HEIGHT / 2, Math.min(CANVAS_HEIGHT - PLAYER_HEIGHT / 2, player.y));

            // Auto-fire
            const cooldown = rapidRef.current ? BULLET_COOLDOWN * 0.5 : BULLET_COOLDOWN;
            bulletTimerRef.current += dt;
            if (bulletTimerRef.current >= cooldown)
            {
                bulletTimerRef.current -= cooldown;
                fireBullet(player.x, player.y);
            }

            // Power-up timers
            if (shieldRef.current)
            {
                shieldTimerRef.current -= dt;
                if (shieldTimerRef.current <= 0) shieldRef.current = false;
            }
            if (spreadRef.current)
            {
                spreadTimerRef.current -= dt;
                if (spreadTimerRef.current <= 0) spreadRef.current = false;
            }
            if (rapidRef.current)
            {
                rapidTimerRef.current -= dt;
                if (rapidTimerRef.current <= 0) rapidRef.current = false;
            }

            // Shield visual
            if (shieldRef.current)
            {
                player.clear();
                drawPlayer(player, true);
                player.circle(0, 0, 22);
                player.stroke({ color: 0x22c55e, width: 2, alpha: 0.6 });
            }
            else
            {
                player.clear();
                drawPlayer(player, true);
            }

            // Spawn enemies
            const spawnInterval = Math.max(
                ENEMY_SPAWN_INTERVAL_MIN,
                ENEMY_SPAWN_INTERVAL_START - elapsed * 0.015
            );
            spawnTimerRef.current += dt;
            while (spawnTimerRef.current >= spawnInterval)
            {
                spawnTimerRef.current -= spawnInterval;
                const enemy = createEnemy(elapsed);
                container.addChild(enemy.gfx);
                enemiesRef.current.push(enemy);
            }

            // Spawn power-ups occasionally
            if (Math.random() < 0.002)
            {
                const pu = createPowerUp();
                container.addChild(pu.gfx);
                powerUpsRef.current.push(pu);
            }

            // Update bullets
            bulletsRef.current = bulletsRef.current.filter((b) =>
            {
                b.gfx.x += b.vel.x * dt;
                b.gfx.y += b.vel.y * dt;

                if (b.gfx.y < -20 || b.gfx.x < -20 || b.gfx.x > CANVAS_WIDTH + 20)
                {
                    container.removeChild(b.gfx);
                    b.gfx.destroy();
                    return false;
                }
                return true;
            });

            // Update enemies
            enemiesRef.current = enemiesRef.current.filter((e) =>
            {
                e.gfx.x += e.vel.x * dt;
                e.gfx.y += e.vel.y * dt;

                if (e.gfx.y > CANVAS_HEIGHT + 50)
                {
                    container.removeChild(e.gfx);
                    e.gfx.destroy();
                    return false;
                }
                return true;
            });

            // Update power-ups
            powerUpsRef.current = powerUpsRef.current.filter((pu) =>
            {
                pu.gfx.y += pu.speed * dt;
                if (pu.gfx.y > CANVAS_HEIGHT + 20)
                {
                    container.removeChild(pu.gfx);
                    pu.gfx.destroy();
                    return false;
                }
                return true;
            });

            // Update particles
            particlesRef.current = particlesRef.current.filter((p) =>
            {
                p.gfx.x += p.vel.x * dt;
                p.gfx.y += p.vel.y * dt;
                p.life -= dt;
                p.gfx.alpha = Math.max(0, p.life / PARTICLE_LIFE);

                if (p.life <= 0)
                {
                    container.removeChild(p.gfx);
                    p.gfx.destroy();
                    return false;
                }
                return true;
            });

            // Update stars (parallax scroll)
            for (const star of starsRef.current)
            {
                star.gfx.y += star.speed * dt;
                if (star.gfx.y > CANVAS_HEIGHT)
                {
                    star.gfx.y = -2;
                    star.gfx.x = Math.random() * CANVAS_WIDTH;
                }
            }

            // Bullet-enemy collision
            for (let ei = enemiesRef.current.length - 1; ei >= 0; ei--)
            {
                const e = enemiesRef.current[ei];
                for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--)
                {
                    const b = bulletsRef.current[bi];
                    const dx = b.gfx.x - e.gfx.x;
                    const dy = b.gfx.y - e.gfx.y;
                    const hitDist = Math.max(e.width, e.height) / 2 + 4;

                    if (dx * dx + dy * dy < hitDist * hitDist)
                    {
                        // Remove bullet
                        container.removeChild(b.gfx);
                        b.gfx.destroy();
                        bulletsRef.current.splice(bi, 1);

                        e.hp -= 1;
                        if (e.hp <= 0)
                        {
                            // Destroy enemy
                            const points = e.kind === 'tank' ? 30 : e.kind === 'fast' ? 15 : 10;
                            scoreRef.current += points;
                            setScore(scoreRef.current);

                            const expColor = e.kind === 'tank' ? 0xa855f7 : e.kind === 'fast' ? 0xfbbf24 : 0xef4444;
                            spawnExplosion(e.gfx.x, e.gfx.y, expColor, 12);

                            container.removeChild(e.gfx);
                            e.gfx.destroy();
                            enemiesRef.current.splice(ei, 1);
                        }
                        break;
                    }
                }
            }

            // Player-enemy collision
            for (let ei = enemiesRef.current.length - 1; ei >= 0; ei--)
            {
                const e = enemiesRef.current[ei];
                const dx = player.x - e.gfx.x;
                const dy = player.y - e.gfx.y;
                const hitDist = (Math.max(e.width, e.height) + PLAYER_WIDTH) / 2 - 4;

                if (dx * dx + dy * dy < hitDist * hitDist)
                {
                    if (shieldRef.current)
                    {
                        // Shield absorbs hit
                        shieldRef.current = false;
                        spawnExplosion(e.gfx.x, e.gfx.y, 0x22c55e, 8);
                        container.removeChild(e.gfx);
                        e.gfx.destroy();
                        enemiesRef.current.splice(ei, 1);
                    }
                    else
                    {
                        // Game over
                        spawnExplosion(player.x, player.y, 0x60a5fa, 20);
                        setStatus('over');
                        statusRef.current = 'over';

                        if (scoreRef.current > highScore)
                        {
                            setHighScore(scoreRef.current);
                        }

                        player.visible = false;
                        showGameOverOverlay();
                        return;
                    }
                }
            }

            // Player-powerup collision
            for (let pi = powerUpsRef.current.length - 1; pi >= 0; pi--)
            {
                const pu = powerUpsRef.current[pi];
                const dx = player.x - pu.gfx.x;
                const dy = player.y - pu.gfx.y;

                if (dx * dx + dy * dy < 400)
                {
                    if (pu.kind === 'shield')
                    {
                        shieldRef.current = true;
                        shieldTimerRef.current = 8;
                    }
                    else if (pu.kind === 'spread')
                    {
                        spreadRef.current = true;
                        spreadTimerRef.current = 6;
                    }
                    else if (pu.kind === 'rapid')
                    {
                        rapidRef.current = true;
                        rapidTimerRef.current = 6;
                    }

                    spawnExplosion(pu.gfx.x, pu.gfx.y, 0xffffff, 6);
                    container.removeChild(pu.gfx);
                    pu.gfx.destroy();
                    powerUpsRef.current.splice(pi, 1);
                }
            }

            // Update UI
            if (scoreTextRef.current)
            {
                scoreTextRef.current.text = `Score: ${scoreRef.current}`;
            }
        };

        tickerCallbackRef.current = gameLoop;
        app.ticker.add(gameLoop);
    }, [cleanupGameObjects, clearOverlay, createEnemy, createPowerUp, drawPlayer, fireBullet, highScore, showGameOverOverlay, spawnExplosion]);

    return (
        <div>
            <p className="text-[#6a7380] dark:text-[#94a3b8] mb-3">
                방향키/WASD로 이동. 총알은 자동 발사! 파워업을 먹으면 강해져요.
                <span className="ml-2 text-xs">
                    [<span className="text-[#22d3ee]">S</span>=확산 <span className="text-[#fbbf24]">R</span>=연사 <span className="text-[#22c55e]">H</span>=실드]
                </span>
            </p>
            <div
                ref={containerRef}
                className="relative w-fit border border-[#d9e0e6] dark:border-[#334155] rounded overflow-hidden"
            />
            <div className="mt-3 flex items-center gap-3 flex-wrap">
                {status !== 'playing' && (
                    <button
                        onClick={startGame}
                        className="px-3 py-2 rounded border border-[#d9e0e6] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:bg-[#f2f5f6] dark:hover:bg-[#334155] transition-colors"
                    >
                        {status === 'idle' ? 'Start' : 'Restart'}
                    </button>
                )}
                <span className="text-sm text-[#6a7380] dark:text-[#94a3b8]">
                    Score: {score}
                </span>
                {highScore > 0 && (
                    <span className="text-sm text-[#6a7380] dark:text-[#94a3b8]">
                        Best: {highScore}
                    </span>
                )}
            </div>
        </div>
    );
}
