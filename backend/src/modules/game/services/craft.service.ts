import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import * as path from "path";
import { promises as fs } from "fs";
import { GamePack, GoalItem, InventoryItem, Item, ItemCategory, Recipe, RequiredMaterial } from "../dto/craft.dto";

@Injectable()
export class CraftService implements OnModuleInit {
    private readonly logger = new Logger(CraftService.name);

    private readonly packPath = path.join(__dirname, "..", "files", "packs");
    private readonly packs = new Map<string, GamePack>();

    async onModuleInit(): Promise<void> {
        const files = await fs.readdir(this.packPath);
        const jsonFiles = files.filter((file) => path.extname(file) === ".json");

        await Promise.all(
            jsonFiles.map(async (file) => {
                const content = await fs.readFile(path.join(this.packPath, file), "utf-8");
                const pack = JSON.parse(content) as GamePack;
                const id = path.basename(file, ".json");

                this.packs.set(id, pack);
            })
        );

        this.logger.log(`Loaded ${this.packs.size} game pack(s)`);
    }

    private getPack(packId: string): GamePack {
        const pack = this.packs.get(packId);

        if (!pack) throw new NotFoundException("Not Found Game Pack");
        return pack;
    }

    getTitles(): { id: string; name: string }[] {
        const packTitles: { id: string; name: string }[] = [];
        for (const [id, pack] of this.packs) {
            packTitles.push({ id, name: pack.game.title });
        }
        return packTitles;
    }

    getPackView(packId: string): { items: Item[]; categories: ItemCategory[] } {
        const pack = this.getPack(packId);

        return {
            items: pack.items,
            categories: pack.categories
        };
    }

    calculateMaterials(packId: string, goals: GoalItem[], inventory: InventoryItem[]): RequiredMaterial[] {
        const pack = this.getPack(packId);

        const recipes = new Map(pack.recipes.map((recipe) => [recipe.output.itemId, recipe]));

        const stock = new Map(inventory.map((item) => [item.itemId, item.quantity]));

        const items = new Map(pack.items.map((item) => [item.id, item]));

        const required = new Map<string, number>();

        for (const goal of goals) {
            this.resolveItem(goal.itemId, goal.quantity, recipes, stock, required, new Set());
        }

        return [...required.entries()].map(([itemId, quantity]) => {
            const item = items.get(itemId);

            return {
                itemId,
                name: item?.name ?? itemId,
                quantity,
                acquisition: item?.acquisition
            };
        });
    }

    private resolveItem(
        itemId: string,
        quantity: number,
        recipes: Map<string, Recipe>,
        stock: Map<string, number>,
        required: Map<string, number>,
        resolving: Set<string>
    ): void {
        if (quantity <= 0) {
            return;
        }

        // 현재 가지고 있는 아이템부터 사용
        const owned = stock.get(itemId) ?? 0;
        const used = Math.min(owned, quantity);

        const remaining = quantity - used;

        stock.set(itemId, owned - used);

        if (remaining === 0) {
            return;
        }

        const recipe = recipes.get(itemId);

        // Recipe가 없으면 최종 채집 재료
        if (!recipe) {
            required.set(itemId, (required.get(itemId) ?? 0) + remaining);

            return;
        }

        // 잘못된 pack에서 순환 recipe가 생기는 것 방지
        if (resolving.has(itemId)) {
            throw new Error(`Circular recipe detected: ${itemId}`);
        }

        resolving.add(itemId);

        const craftCount = Math.ceil(remaining / recipe.output.quantity);

        for (const ingredient of recipe.ingredients) {
            this.resolveItem(ingredient.itemId, ingredient.quantity * craftCount, recipes, stock, required, resolving);
        }

        resolving.delete(itemId);

        // 한 번 제작했을 때 여러 개가 나오는 경우 남는 결과물을 재고로 보관
        const produced = recipe.output.quantity * craftCount;
        const surplus = produced - remaining;

        if (surplus > 0) {
            stock.set(itemId, (stock.get(itemId) ?? 0) + surplus);
        }
    }
}
