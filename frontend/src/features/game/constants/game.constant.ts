import BlackjackGame from "@/features/game/components/games/blackjack/blackjack-game";
import BlackjackOnlineGame from "@/features/game/components/games/blackjack-online/blackjack-online-game";
import BreakoutGame from "@/features/game/components/games/breakout/breakout-game";
import BulletDodgeGame from "@/features/game/components/games/bullet-dodge/bullet-dodge-game";
import FlappyBirdGame from "@/features/game/components/games/flappy-bird/flappy-bird-game";
import Game2048 from "@/features/game/components/games/game-2048/game-2048";
import PongGame from "@/features/game/components/games/pong/pong-game";
import SnakeGame from "@/features/game/components/games/snake/snake-game";
import SpaceShooterGame from "@/features/game/components/games/space-shooter/space-shooter-game";
import TowerSmashGame from "@/features/game/components/games/tower-smash/tower-smash-game";
import type { GameDefinition } from "@/features/game/types/game.type";

export const GAMES: GameDefinition[] = [
    { id: "bullet-dodge", label: "총알 피하기", description: "날아오는 탄환을 피해 오래 버티세요.", component: BulletDodgeGame },
    { id: "snake", label: "뱀 게임", description: "먹이를 먹으며 뱀을 길게 만드세요.", component: SnakeGame },
    { id: "pong", label: "Pong", description: "패들을 움직여 공을 되돌리세요.", component: PongGame },
    { id: "breakout", label: "벽돌깨기", description: "공으로 모든 벽돌을 부수세요.", component: BreakoutGame },
    { id: "flappy-bird", label: "Flappy Bird", description: "파이프 사이를 통과하세요.", component: FlappyBirdGame },
    { id: "2048", label: "2048", description: "같은 숫자를 합쳐 2048을 만드세요.", component: Game2048 },
    { id: "space-shooter", label: "Space Shooter", description: "우주선을 조종해 적을 물리치세요.", component: SpaceShooterGame },
    { id: "tower-smash", label: "Tower Smash (3D)", description: "공을 쏴 탑을 무너뜨리세요.", component: TowerSmashGame },
    { id: "blackjack", label: "블랙잭", description: "딜러보다 21에 가깝게 만드세요.", component: BlackjackGame },
    { id: "blackjack-online", label: "블랙잭 온라인", description: "legacy Nest 서버의 Socket.IO 방에서 함께 플레이합니다.", component: BlackjackOnlineGame }
];
