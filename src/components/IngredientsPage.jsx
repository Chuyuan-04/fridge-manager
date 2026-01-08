import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Trash2, Minus } from 'lucide-react';
import { quickTemplates } from '../utils/templates';
import { getTodayDate } from '../utils/dateUtils';

const LS_CUSTOM_TEMPLATES = 'fm_customTemplates_v1';

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function IngredientsPage({ ingredients, setIngredients, onComplete }) {
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ 自定义食物模板：让“手动添加”出现到食物版里，并可永久保留/删除
  const [customTemplates, setCustomTemplates] = useState(() => loadLS(LS_CUSTOM_TEMPLATES, []));

  useEffect(() => {
    saveLS(LS_CUSTOM_TEMPLATES, customTemplates);
  }, [customTemplates]);

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    amount: '',
    unit: '个',
    purchaseDate: getTodayDate(),
    storage: 'fridge',
    shelfLife: 7,
    category: '其他',
  });

  // ✅ 食物版：内置模板 + 自定义模板（去重按 name）
  const allTemplates = useMemo(() => {
    const map = new Map();

    // 内置模板优先
    for (const t of quickTemplates) {
      map.set(t.name, { ...t, source: 'builtin' });
    }
    // 自定义模板补充/覆盖（如果同名，优先用自定义）
    for (const t of customTemplates) {
      map.set(t.name, { ...t, source: 'custom' });
    }

    return Array.from(map.values());
  }, [customTemplates]);

  // ✅ 统计某个食材当前库存（支持你现在“同名多条”）
  const getCount = (name) => {
    return ingredients
      .filter(i => i.name === name)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  };

  // ✅ 给某个食材 +1 / -1（-1 会优先从“最早的那条记录”扣，扣到 0 自动删）
  const changeCountByOne = (name, unitFallback = '个') => {
    // +1
    setIngredients(prev => {
      const unit = prev.find(i => i.name === name)?.unit || unitFallback;

      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          name,
          amount: 1,
          unit,
          purchaseDate: getTodayDate(),
          storage: 'fridge',
          shelfLife: 7,
        }
      ];
    });
  };

  const decreaseCountByOne = (name) => {
    setIngredients(prev => {
      // 找到第一条同名记录（也可以改成找最新/最早，这里用最早）
      const idx = prev.findIndex(i => i.name === name);
      if (idx === -1) return prev;

      const copy = [...prev];
      const item = copy[idx];
      const newAmount = (Number(item.amount) || 0) - 1;

      if (newAmount <= 0) {
        copy.splice(idx, 1);
      } else {
        copy[idx] = { ...item, amount: newAmount };
      }
      return copy;
    });
  };

  // ✅ 点击模板卡片：默认 +1（这里保留你习惯的“点卡片即可+1”）
  const onAddTemplate = (template) => {
    // 如果你希望模板带 storage/shelfLife，就用 template 的值覆盖默认
    setIngredients(prev => ([
      ...prev,
      {
        ...template,
        id: Date.now() + Math.random(),
        amount: 1,
        purchaseDate: getTodayDate(),
      }
    ]));
  };

  // ✅ 手动添加：1) 把食材加入“自定义模板” 2) 同时把库存按输入 amount 加进去
  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount) return;

    const name = newIngredient.name.trim();
    if (!name) return;

    // 1) 加入自定义模板（让它出现在“食物版”里）
    setCustomTemplates(prev => {
      const exists = prev.some(t => t.name === name);
      if (exists) return prev;
      return [
        ...prev,
        {
          name,
          unit: newIngredient.unit || '个',
          shelfLife: Number(newIngredient.shelfLife) || 7,
          storage: newIngredient.storage || 'fridge',
          category: newIngredient.category || '其他',
        }
      ];
    });

    // 2) 把库存加进去（按用户输入 amount）
    setIngredients(prev => ([
      ...prev,
      {
        id: Date.now() + Math.random(),
        name,
        amount: parseFloat(newIngredient.amount),
        unit: newIngredient.unit || '个',
        purchaseDate: newIngredient.purchaseDate || getTodayDate(),
        storage: newIngredient.storage || 'fridge',
        shelfLife: Number(newIngredient.shelfLife) || 7,
      }
    ]));

    setNewIngredient({
      name: '',
      amount: '',
      unit: '个',
      purchaseDate: getTodayDate(),
      storage: 'fridge',
      shelfLife: 7,
      category: '其他',
    });

    setShowAddForm(false);
  };

  // ✅ 从“食物版”移除（只移除模板，不强制清库存；你想连库存一起清的话也可以改）
  const removeFromCatalog = (name) => {
    setCustomTemplates(prev => prev.filter(t => t.name !== name));
  };

  // ✅ 分组：按 category（没有就 “其他”）
  const groupedTemplates = useMemo(() => {
    const groups = {};
    for (const t of allTemplates) {
      const c = t.category || '其他';
      if (!groups[c]) groups[c] = [];
      groups[c].push(t);
    }

    const order = ['肉类', '蔬菜', '水果', '蛋类', '乳制品', '饮料', '主食', '调味', '其他'];
    const ordered = {};
    for (const k of order) if (groups[k]?.length) ordered[k] = groups[k];
    Object.keys(groups).forEach(k => { if (!ordered[k]) ordered[k] = groups[k]; });

    return ordered;
  }, [allTemplates]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">添加冰箱里的食材</h2>
          <p className="text-gray-600 mb-6 text-sm">不需要一次录完，之后随时可以添加</p>

          {/* ✅ 食物版（分类 + 计数 + 可减） */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">食物版（点击卡片 +1）</h3>
              <div className="text-xs text-gray-400">右上角可 −1；数量为 0 仍会显示</div>
            </div>

            <div className="space-y-5">
              {Object.entries(groupedTemplates).map(([category, items]) => (
                <div key={category}>
                  <div className="text-sm font-semibold text-gray-700 mb-2">{category}</div>

                  <div className="grid grid-cols-3 gap-3">
                    {items.map((template, idx) => {
                      const count = getCount(template.name);
                      const isAdded = count > 0;
                      const showRemove = template.source === 'custom'; // 只有自定义的才允许从食物版移除

                      return (
                        <div key={`${category}-${idx}`} className="relative">
                          {/* 主卡片：点一下 +1 */}
                          <button
                            onClick={() => onAddTemplate(template)}
                            className={[
                              "w-full relative p-3 border-2 rounded-lg text-left transition",
                              isAdded
                                ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                                : "border-gray-200 hover:border-blue-500 hover:bg-blue-50",
                            ].join(" ")}
                          >
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-xs text-gray-500">
                              保质期 {template.shelfLife} 天
                            </div>

                            {/* 右上角：数量徽标 */}
                            <div className="absolute top-2 right-2 flex items-center gap-2">
                              <span
                                className={[
                                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                                  isAdded ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700",
                                ].join(" ")}
                              >
                                {count}
                              </span>

                              {/* −1 */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (count > 0) decreaseCountByOne(template.name);
                                }}
                                className={[
                                  "w-6 h-6 rounded-full border flex items-center justify-center transition",
                                  count > 0
                                    ? "border-blue-300 text-blue-600 hover:bg-blue-100"
                                    : "border-gray-200 text-gray-300 cursor-not-allowed",
                                ].join(" ")}
                                title="减少 1"
                              >
                                <Minus size={14} />
                              </button>
                            </div>
                          </button>

                          {/* 自定义模板：可从食物版移除（右下角小字按钮） */}
                          {showRemove && (
                            <button
                              type="button"
                              onClick={() => removeFromCatalog(template.name)}
                              className="absolute bottom-2 right-2 text-[11px] text-gray-400 hover:text-red-600 transition"
                              title="从食物版移除（不影响已有库存记录）"
                            >
                              从食物版移除
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ 手动添加 */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition"
            >
              <Plus size={20} />
              手动添加食材（会加入食物版）
            </button>

            {showAddForm && (
              <div className="mt-4 p-4 border-2 border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    placeholder="食材名称"
                    value={newIngredient.name}
                    onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="数量"
                      value={newIngredient.amount}
                      onChange={e => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newIngredient.unit}
                      onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>个</option>
                      <option>g</option>
                      <option>ml</option>
                      <option>盒</option>
                      <option>包</option>
                    </select>
                  </div>

                  <input
                    type="date"
                    value={newIngredient.purchaseDate}
                    onChange={e => setNewIngredient({ ...newIngredient, purchaseDate: e.target.value })}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <select
                    value={newIngredient.storage}
                    onChange={e => setNewIngredient({ ...newIngredient, storage: e.target.value })}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fridge">冷藏</option>
                    <option value="freezer">冷冻</option>
                    <option value="pantry">常温</option>
                  </select>

                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">分类</label>
                    <select
                      value={newIngredient.category}
                      onChange={e => setNewIngredient({ ...newIngredient, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>肉类</option>
                      <option>蔬菜</option>
                      <option>水果</option>
                      <option>蛋类</option>
                      <option>乳制品</option>
                      <option>饮料</option>
                      <option>主食</option>
                      <option>调味</option>
                      <option>其他</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">保质期（天）</label>
                    <input
                      type="number"
                      value={newIngredient.shelfLife}
                      onChange={e => setNewIngredient({ ...newIngredient, shelfLife: parseInt(e.target.value || '0', 10) })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={addIngredient}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  添加
                </button>
              </div>
            )}
          </div>

          {/* ✅ 底部按钮 */}
          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              🎉 完成设置，进入主页
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              稍后再加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IngredientsPage;
