import React from 'react';
import { TrendingUp } from 'lucide-react';
import FridgePanel from './FridgePanel';
import RecipePanel from './RecipePanel';
import { getDaysLeft, getTodayDate } from '../utils/dateUtils';
import { DndContext } from '@dnd-kit/core';

function calcExpiresAt(purchaseDate, shelfLife) {
  if (!purchaseDate || typeof shelfLife !== 'number') return '';
  const d = new Date(purchaseDate);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + shelfLife);
  return d.toISOString().split('T')[0];
}

function MainPage({ ingredients, setIngredients, preferences, onBack, onClearFridge }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const toStorage = over.id; // 'fridge' | 'freezer'
    const data = active.data?.current;
    if (!data) return;

    const { name, unit, fromStorage, amount: aggAmount, expiresAt } = data;

    if (!name || !fromStorage) return;
    if (toStorage === fromStorage) return;
    if (toStorage !== 'fridge' && toStorage !== 'freezer') return;

    // ✅ 询问移动多少（默认 1）
    const maxMove = Math.max(1, Number(aggAmount) || 1);
    const raw = window.prompt(`要移动多少数量？(1 ~ ${maxMove})`, '1');
    if (raw === null) return;
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    const moveN = Math.min(parsed, maxMove);

    setIngredients((prev) => {
      const todayStr = getTodayDate();
      const today = new Date(todayStr);
      const list = [...prev];

      // ---- 从 fromStorage 扣掉 moveN：按 “name + unit + fromStorage + expiresAt(到期日)” 精准扣这一批 ----
      let remainToRemove = moveN;

      const candidates = list
        .map((it, idx) => ({ it, idx }))
        .filter(({ it }) => {
          const itStorage = it.storage || 'fridge';
          const itUnit = it.unit || '';
          const itShelf = typeof it.shelfLife === 'number' ? it.shelfLife : 7;
          const itExp = calcExpiresAt(it.purchaseDate, itShelf);

          return (
            it.name === name &&
            itUnit === (unit || '') &&
            itStorage === fromStorage &&
            itExp === expiresAt
          );
        })
        .sort(
          (a, b) =>
            getDaysLeft(a.it.purchaseDate, a.it.shelfLife, a.it.storage) -
            getDaysLeft(b.it.purchaseDate, b.it.shelfLife, b.it.storage)
        );

      for (const { it, idx } of candidates) {
        if (remainToRemove <= 0) break;

        const cur = Number(it.amount) || 0;
        if (cur <= 0) continue;

        const take = Math.min(cur, remainToRemove);
        const left = cur - take;

        if (left <= 0) list[idx] = null;
        else list[idx] = { ...it, amount: left };

        remainToRemove -= take;
      }

      const cleaned = list.filter(Boolean);

      // ---- 往 toStorage 加 moveN ----
      if (toStorage === 'freezer') {
        // fridge -> freezer：
        // 你现在 freezer 显示“冷冻保存”，所以我们只需要把这批移动过去即可（作为一个新记录）
        // baseShelfLife 推断：从同批次里随便拿一条
        const sample = candidates[0]?.it;
        const baseShelfLife =
          sample && typeof sample.baseShelfLife === 'number'
            ? sample.baseShelfLife
            : sample && typeof sample.shelfLife === 'number'
            ? sample.shelfLife
            : 7;

        cleaned.push({
          id: Date.now() + Math.random(),
          name,
          amount: moveN,
          unit: unit || '个',
          storage: 'freezer',
          baseShelfLife,
          shelfLife: baseShelfLife + 90, // 占位：freezer 不显示 daysLeft
          purchaseDate: todayStr,
        });
      } else {
        // freezer -> fridge：解冻后固定剩 2 天
        // baseShelfLife 推断：从 freezer 里同批次拿一条
        const sample = candidates[0]?.it;
        const baseShelfLife =
          sample && typeof sample.baseShelfLife === 'number'
            ? sample.baseShelfLife
            : sample && typeof sample.shelfLife === 'number'
            ? Math.max(1, sample.shelfLife - 90)
            : 7;

        const purchase = new Date(today);
        purchase.setDate(purchase.getDate() - (baseShelfLife - 2));
        const purchaseDate2DaysLeft = purchase.toISOString().split('T')[0];

        cleaned.push({
          id: Date.now() + Math.random(),
          name,
          amount: moveN,
          unit: unit || '个',
          storage: 'fridge',
          baseShelfLife,
          shelfLife: baseShelfLife,
          purchaseDate: purchaseDate2DaysLeft,
        });
      }

      return cleaned;
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">🧊 我的冰箱</h1>

            <div className="flex items-center gap-4 text-sm">
              <button className="text-gray-600 hover:text-gray-800 transition">设置</button>
              <button className="text-gray-600 hover:text-gray-800 transition">统计</button>

              <button
                className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition"
                onClick={() => {
                  if (!onClearFridge) return;
                  const ok = window.confirm('确定要清空冰箱里的所有食材吗？此操作不可撤销。');
                  if (ok) onClearFridge();
                }}
              >
                清空冰箱
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FridgePanel
                title="🧊 冷藏（可拖到右侧冷冻）"
                storageFilter="fridge"
                ingredients={ingredients}
                setIngredients={setIngredients}
                onBack={onBack}
              />

              <FridgePanel
                title="❄️ 冷冻（可拖到左侧冷藏）"
                storageFilter="freezer"
                ingredients={ingredients}
                setIngredients={setIngredients}
                onBack={onBack}
              />
            </div>

            <RecipePanel
              ingredients={ingredients}
              setIngredients={setIngredients}
              preferences={preferences}
            />
          </div>

          {ingredients.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-purple-600" />
                快速统计
              </h3>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{ingredients.length}</div>
                  <div className="text-sm text-gray-600 mt-1">当前记录数</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {ingredients.filter(i => getDaysLeft(i.purchaseDate, i.shelfLife, i.storage) <= 3).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">即将过期记录</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {ingredients.filter(i =>
                      (i.storage || 'fridge') !== 'freezer' &&
                      getDaysLeft(i.purchaseDate, i.shelfLife, i.storage) > 7
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">新鲜记录</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mt-3">
                合并展示按 “同名 + 同单位 + 同存储 + 同到期日(expiresAt)” 进行；因此解冻回冷藏（剩 2 天）不会与原冷藏（剩 7 天）合并。
              </div>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
}

export default MainPage;
