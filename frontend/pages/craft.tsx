import React, { useCallback, useEffect, useState } from "react";

export const title = "Craft";
export const subTitle = "게임 팩을 골라 목표/보유 수량으로 필요 재료를 계산";

const ORIGIN = process.env.NEXT_PUBLIC_BE_URL ?? "http://localhost:9090";

// ---- Backend와 맞춘 타입 ----
interface PackTitle
{
    id: string;
    name: string;
}

interface Acquisition
{
    method?: string;
    locations?: string[];
    time?: string;
    condition?: string;
}

type ItemType = "material" | "intermediate" | "craftable";

interface ItemCategory
{
    id: string;
    name: string;
}

interface Item
{
    id: string;
    name: string;
    type: ItemType;
    category?: string[];
    acquisition?: Acquisition[];
}

interface PackView
{
    items: Item[];
    categories: ItemCategory[];
}

interface RequiredMaterial
{
    itemId: string;
    name: string;
    quantity: number;
    acquisition?: Acquisition[];
}

// itemId → { have: 현재 수량, need: 필요 수량 }
type Counts = Record<string, { have: number; need: number }>;

function acquisitionText(list?: Acquisition[]): string
{
    if (!list || list.length === 0) return "제작 아이템";
    return list
        .map((a) =>
        {
            const where = a.locations?.length ? a.locations.join(", ") : "";
            const parts = [a.method, where, a.time].filter(Boolean);
            return parts.join(" · ");
        })
        .join(" / ");
}

// 이미지: frontend/public/craft/items/{item.id}.webp → /craft/items/{id}.webp
function ItemIcon({ id, alt }: { id: string; alt: string })
{
    const [ok, setOk] = useState(true);

    if (!ok)
    {
        return <span className="inline-block w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 shrink-0" aria-hidden />;
    }

    return (
        <img
            src={`/craft/items/${id}.webp`}
            alt={alt}
            width={28}
            height={28}
            loading="lazy"
            className="w-7 h-7 rounded object-contain shrink-0"
            onError={() => setOk(false)}
        />
    );
}

export default function Craft()
{
    const [packs, setPacks] = useState<PackTitle[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");

    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
    const [onlyNeeded, setOnlyNeeded] = useState(false);
    const [loadedPackId, setLoadedPackId] = useState<string>("");
    const [counts, setCounts] = useState<Counts>({});

    const [materials, setMaterials] = useState<RequiredMaterial[] | null>(null);

    const [loadingItems, setLoadingItems] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState<string>("");

    // 1) 진입 시 팩 목록 로드
    useEffect(() =>
    {
        (async () =>
        {
            try
            {
                const res = await fetch(`${ORIGIN}/craft/titles`);
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                const list: PackTitle[] = await res.json();
                setPacks(list);
                if (list.length > 0) setSelectedId(list[0].id);
            }
            catch (e)
            {
                setError(`팩 목록을 불러오지 못했습니다: ${String(e)}`);
            }
        })();
    }, []);

    // 2) 불러오기 → 선택 팩의 아이템 로드
    const loadItems = useCallback(async () =>
    {
        if (!selectedId) return;
        setLoadingItems(true);
        setError("");
        setMaterials(null);
        try
        {
            const res = await fetch(`${ORIGIN}/craft/${selectedId}`);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const view: PackView = await res.json();
            const craftable = view.items.filter((it) => it.type === "craftable");
            setItems(craftable);
            setCategories(view.categories ?? []);
            setSelectedCats(new Set());
            setLoadedPackId(selectedId);
            setCounts(Object.fromEntries(craftable.map((it) => [it.id, { have: 0, need: 0 }])));
        }
        catch (e)
        {
            setItems([]);
            setCategories([]);
            setSelectedCats(new Set());
            setLoadedPackId("");
            setError(`아이템을 불러오지 못했습니다: ${String(e)}`);
        }
        finally
        {
            setLoadingItems(false);
        }
    }, [selectedId]);

    const bump = useCallback((itemId: string, key: "have" | "need", delta: number) =>
    {
        setCounts((prev) =>
        {
            const cur = prev[itemId] ?? { have: 0, need: 0 };
            const next = Math.max(0, cur[key] + delta);
            return { ...prev, [itemId]: { ...cur, [key]: next } };
        });
    }, []);

    const setCount = useCallback((itemId: string, key: "have" | "need", value: number) =>
    {
        const v = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
        setCounts((prev) =>
        {
            const cur = prev[itemId] ?? { have: 0, need: 0 };
            return { ...prev, [itemId]: { ...cur, [key]: v } };
        });
    }, []);

    const toggleCat = useCallback((catId: string) =>
    {
        setSelectedCats((prev) =>
        {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    }, []);

    // 4) 계산 → 목표(need)/보유(have) 차이로 필요 재료 요청
    const calculate = useCallback(async () =>
    {
        if (!loadedPackId) return;

        const goals = Object.entries(counts)
            .filter(([, c]) => c.need > 0)
            .map(([itemId, c]) => ({ itemId, quantity: c.need }));

        if (goals.length === 0)
        {
            setError("필요 수량(목표)을 1개 이상 지정해주세요.");
            return;
        }

        const inventory = Object.entries(counts)
            .filter(([, c]) => c.have > 0)
            .map(([itemId, c]) => ({ itemId, quantity: c.have }));

        setCalculating(true);
        setError("");
        try
        {
            const res = await fetch(`${ORIGIN}/craft/${loadedPackId}/materials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goals, inventory })
            });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const list: RequiredMaterial[] = await res.json();
            setMaterials(list);
        }
        catch (e)
        {
            setMaterials(null);
            setError(`계산에 실패했습니다: ${String(e)}`);
        }
        finally
        {
            setCalculating(false);
        }
    }, [counts, loadedPackId]);

    // 선택된 카테고리가 없으면 전체, 있으면 OR 필터
    const catFiltered = selectedCats.size === 0
        ? items
        : items.filter((it) => (it.category ?? []).some((c) => selectedCats.has(c)));

    // "필요 수량만 보기" → need >= 1 인 항목만
    const visibleItems = onlyNeeded
        ? catFiltered.filter((it) => (counts[it.id]?.need ?? 0) >= 1)
        : catFiltered;

    const btn = "px-2 py-1 rounded text-xs font-mono border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30";
    const stepBtn = "w-6 h-6 rounded border border-gray-300 dark:border-gray-600 text-sm leading-none hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30";
    const numInput = "w-12 text-center px-1 py-0.5 rounded text-xs font-mono border border-gray-300 dark:border-gray-600 bg-transparent";

    return (
        <section className="panel">
            {/* 1·2) 팩 선택 + 불러오기 */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label htmlFor="pack-select" className="text-sm font-semibold normal-case tracking-normal">
                    Pack
                </label>
                <select
                    id="pack-select"
                    className="min-w-60"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={packs.length === 0}
                >
                    {packs.length === 0 && <option value="">(팩 없음)</option>}
                    {packs.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                <button className={btn} onClick={loadItems} disabled={!selectedId || loadingItems}>
                    {loadingItems ? "불러오는 중..." : "불러오기"}
                </button>
            </div>

            {/* 카테고리 필터 (다중 OR) + 요약 토글 */}
            {items.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {categories.map((cat) =>
                    {
                        const active = selectedCats.has(cat.id);
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => toggleCat(cat.id)}
                                className={[
                                    "px-3 py-1 rounded-full text-xs border transition-colors",
                                    active
                                        ? "bg-[#2f6f76] text-white border-[#2f6f76]"
                                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                ].join(" ")}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                    {selectedCats.size > 0 && (
                        <button
                            type="button"
                            onClick={() => setSelectedCats(new Set())}
                            className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            초기화
                        </button>
                    )}

                    <button
                        type="button"
                        aria-pressed={onlyNeeded}
                        onClick={() => setOnlyNeeded((v) => !v)}
                        className={[
                            "ml-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors",
                            onlyNeeded
                                ? "bg-[#2f6f76] text-white border-[#2f6f76]"
                                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                        ].join(" ")}
                    >
                        요약
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-3 text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                    {error}
                </div>
            )}

            {/* 좌: 아이템별 현재/필요 수량 · 우: 계산 결과 */}
            {items.length > 0 && (
                <div className="grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,3fr)_2rem_minmax(0,2fr)] gap-4 items-start">
                    {/* 3) 아이템 표 */}
                    <div>
                        <div className="rounded border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
                            <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-3 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-500">
                                <span>아이템</span>
                                <span className="text-center w-32">현재 수량</span>
                                <span className="text-center w-32">필요 수량</span>
                            </div>
                            <div className="max-h-[calc(100vh-360px)] min-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                {visibleItems.map((it) =>
                                {
                                    const c = counts[it.id] ?? { have: 0, need: 0 };
                                    return (
                                        <div key={it.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-3 py-1.5">
                                            <div className="min-w-0 flex items-center gap-2">
                                                <ItemIcon id={it.id} alt={it.name} />
                                                <div className="text-sm truncate" title={acquisitionText(it.acquisition)}>{it.name}</div>
                                            </div>
                                            <div className="flex items-center gap-1 w-32 justify-center">
                                                <button className={stepBtn} onClick={() => bump(it.id, "have", -1)} disabled={c.have <= 0}>−</button>
                                                <input
                                                    className={numInput}
                                                    value={c.have}
                                                    onChange={(e) => setCount(it.id, "have", Number(e.target.value))}
                                                    inputMode="numeric"
                                                />
                                                <button className={stepBtn} onClick={() => bump(it.id, "have", 1)}>+</button>
                                            </div>
                                            <div className="flex items-center gap-1 w-32 justify-center">
                                                <button className={stepBtn} onClick={() => bump(it.id, "need", -1)} disabled={c.need <= 0}>−</button>
                                                <input
                                                    className={numInput}
                                                    value={c.need}
                                                    onChange={(e) => setCount(it.id, "need", Number(e.target.value))}
                                                    inputMode="numeric"
                                                />
                                                <button className={stepBtn} onClick={() => bump(it.id, "need", 1)}>+</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button className={btn} onClick={calculate} disabled={calculating}>
                            {calculating ? "계산 중..." : "필요 재료 계산"}
                        </button>
                    </div>

                    {/* 여백 (그리드 가운데 컬럼) */}
                    <div className="hidden min-[900px]:block" />

                    {/* 4) 계산 결과 */}
                    <div>
                        {materials && (
                            <div className="rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-500">
                                    필요 재료 ({materials.length})
                                </div>
                                {materials.length === 0 ? (
                                    <div className="px-3 py-3 text-sm text-gray-400">추가로 필요한 재료가 없습니다.</div>
                                ) : (
                                    <div className="max-h-[calc(100vh-320px)] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                        {materials.map((m) => (
                                            <div key={m.itemId} className="flex items-center gap-2 px-3 py-2">
                                                <ItemIcon id={m.itemId} alt={m.name} />
                                                <span className="text-sm flex-1 truncate" title={acquisitionText(m.acquisition)}>{m.name}</span>
                                                <span className="text-sm font-mono font-semibold tabular-nums">{m.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
