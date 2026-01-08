import React, { useMemo } from "react";
import { Clock, Plus } from "lucide-react";
import IngredientCard from "./IngredientCard";
import { getDaysLeft, getTodayDate } from "../utils/dateUtils";
import { useDroppable } from "@dnd-kit/core";

// ---------- helpers ----------
function calcExpiresAt(purchaseDate, shelfLife) {
  if (!purchaseDate || typeof shelfLife !== "number") return "";
  const d = new Date(purchaseDate);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + shelfLife);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function FridgePanel({
  title = "我的冰箱",
  storageFilter,
  ingredients,
  setIngredients,
  onBack,
}) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: storageFilter || "fridge",
  });

  // 当前面板数据
  const filteredIngredients = useMemo(() => {
    if (!storageFilter) return ingredients;
    return ingredients.filter((i) => (i.storage || "fridge") === storageFilter);
  }, [ingredients, storageFilter]);

  /**
   * ✅ 聚合规则（你要的逻辑）：
   * 只有 name + storage + unit + expiresAt(到期日) 完全一致才合并
   */
  const aggregated = useMemo(() => {
    const map = new Map();

    for (const it of filteredIngredients) {
      const name = it.name;
      const storage = it.storage || storageFilter || "fridge";
      const unit = it.unit || "";
      const shelfLife = typeof it.shelfLife === "number" ? it.shelfLife : 7;

      const expiresAt = calcExpiresAt(it.purchaseDate, shelfLife);
      const key = `${name}__${storage}__${unit}__${expiresAt}`;

      if (!map.has(key)) {
        map.set(key, { ...it, storage, unit, shelfLife, _expiresAt: expiresAt, _aggKey: key });
      } else {
        const prev = map.get(key);
        const amount = (Number(prev.amount) || 0) + (Number(it.amount) || 0);

        // 展示用：选更早过期的一条作为代表（其实 key 已经同到期日，这里只是稳妥）
        const prevDays = getDaysLeft(prev.purchaseDate, prev.shelfLife, prev.storage);
        const itDays = getDaysLeft(it.purchaseDate, it.shelfLife, it.storage);
        const pick = itDays < prevDays ? it : prev;

        map.set(key, {
          ...pick,
          amount,
          storage,
          unit,
          shelfLife,
          _expiresAt: expiresAt,
          _aggKey: key,
        });
      }
    }

    return Array.from(map.values());
  }, [filteredIngredients, storageFilter]);

  /**
   * ✅ 加减逻辑：对“同一批次”（同到期日）加减
   */
  const updateAmount = (aggItem, delta) => {
    const name = aggItem.name;
    const storage = aggItem.storage || storageFilter || "fridge";
    const unit = aggItem.unit || "个";
    const shelfLife = typeof aggItem.shelfLife === "number" ? aggItem.shelfLife : 7;
    const expiresAt = aggItem._expiresAt || calcExpiresAt(aggItem.purchaseDate, shelfLife);

    setIngredients((prev) => {
      const list = [...prev];

      if (delta > 0) {
        // ✅ 补充：新增一条“今天买的”同类（自然有自己的到期日）
        list.push({
          id: Date.now() + Math.random(),
          name,
          amount: 1,
          unit,
          purchaseDate: getTodayDate(),
          storage,
          shelfLife,
          baseShelfLife: aggItem.baseShelfLife,
        });
        return list;
      }

      // ✅ 用了：只扣“同到期日”的那一批里最早过期的记录
      const candidates = list
        .map((it, idx) => ({ it, idx }))
        .filter(({ it }) => {
          const itStorage = it.storage || "fridge";
          const itUnit = it.unit || "";
          const itShelf = typeof it.shelfLife === "number" ? it.shelfLife : 7;
          const itExp = calcExpiresAt(it.purchaseDate, itShelf);

          return (
            it.name === name &&
            itStorage === storage &&
            itUnit === (unit || "") &&
            itExp === expiresAt
          );
        })
        .sort(
          (a, b) =>
            getDaysLeft(a.it.purchaseDate, a.it.shelfLife, a.it.storage) -
            getDaysLeft(b.it.purchaseDate, b.it.shelfLife, b.it.storage)
        );

      if (candidates.length === 0) return list;

      const { it: target, idx } = candidates[0];
      const newAmount = (Number(target.amount) || 0) - 1;

      if (newAmount <= 0) list.splice(idx, 1);
      else list[idx] = { ...target, amount: newAmount };

      return list;
    });
  };

  const emptyEmoji =
    storageFilter === "freezer" ? "❄️" : storageFilter === "fridge" ? "🧊" : "📦";

  return (
    <div
      ref={setDropRef}
      className={`bg-white rounded-lg shadow-lg p-6 transition ${
        isOver ? "ring-2 ring-blue-300" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="text-blue-600" />
          {title}
        </h2>

        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm transition"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      {aggregated.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">{emptyEmoji}</div>
          <p>{title} 还没有食材</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-700 transition"
          >
            添加第一个食材 →
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {aggregated
              .slice()
              .sort(
                (a, b) =>
                  getDaysLeft(a.purchaseDate, a.shelfLife, a.storage) -
                  getDaysLeft(b.purchaseDate, b.shelfLife, b.storage)
              )
              .map((item) => (
                <IngredientCard
                  key={item._aggKey || `${item.storage}__${item.name}__${item.unit}__${item._expiresAt}`}
                  item={item}
                  onUpdateAmount={updateAmount}
                />
              ))}
          </div>

          <div className="text-xs text-gray-400 mt-3">
            提示：请从卡片左侧「⋮⋮」把手拖动。
          </div>
        </>
      )}
    </div>
  );
}

export default FridgePanel;
