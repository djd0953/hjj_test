export interface GamePack {
    game: Game;
    items: Item[];
    categories: ItemCategory[];
    recipes: Recipe[];
}

export interface Game {
    title: string;
    version: string;
}

export interface ItemCategory {
    id: string;
    name: string;
}

type ItemType = "material" | "intermediate" | "craftable";

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    category?: string[];
    acquisition?: Acquisition[];
}

export interface Acquisition {
    method?: string;
    locations?: string[];
    time?: string;
    condition?: string;
}

export interface Recipe {
    output: RecipeItem;
    ingredients: RecipeItem[];
}

export interface RecipeItem {
    itemId: string;
    quantity: number;
}

export interface InventoryItem {
    itemId: string;
    quantity: number;
}

export interface GoalItem {
    itemId: string;
    quantity: number;
}

export interface RequiredMaterial {
    itemId: string;
    name: string;
    quantity: number;
    acquisition?: Acquisition[];
}

export interface CalculateMaterialsDto {
    goals: GoalItem[];
    inventory: InventoryItem[];
}
