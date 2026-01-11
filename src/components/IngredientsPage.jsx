import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Trash2, Minus, ChevronDown } from 'lucide-react';
import { quickTemplates } from '../utils/templates';
import { getTodayDate } from '../utils/dateUtils';
import { supabase } from '../config/supabaseClient';

const LS_CUSTOM_TEMPLATES = 'fm_customTemplates_v1';

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function IngredientsPage({ ingredients, setIngredients, onComplete, user }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [customTemplates, setCustomTemplates] = useState(() => loadLS(LS_CUSTOM_TEMPLATES, []));

  useEffect(() => { saveLS(LS_CUSTOM_TEMPLATES, customTemplates); }, [customTemplates]);

  const [newIngredient, setNewIngredient] = useState({
    name: '', amount: '', unit: '个', purchaseDate: getTodayDate(), storage: 'fridge', shelfLife: 7, category: '其他',
  });

  // 格式化输出给 Supabase
  const formatForDB = (item) => ({
    id: item.id,
    user_id: user?.id,
    name: item.name,
    amount: parseFloat(item.amount) || 0,
    unit: item.unit,
    storage: item.storage,
    category: item.category || '其他', // ✅ 确保分类传给后端
    purchase_date: item.purchaseDate || getTodayDate(),
  });

  // 合并内置和自定义模板
  const allTemplates = useMemo(() => {
    const map = new Map();
    quickTemplates.forEach(t => map.set(t.name, { ...t, source: 'builtin' }));
    customTemplates.forEach(t => map.set(t.name, { ...t, source: 'custom' }));
    return Array.from(map.values());
  }, [customTemplates]);

  const getCount = (name) => ingredients.filter(i => i.name === name).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  // 操作：点击卡片 +1
  const onAddTemplate = async (template) => {
    const newItem = { ...template, id: crypto.randomUUID(), amount: 1, purchaseDate: getTodayDate() };
    setIngredients(prev => [...prev, newItem]);
    if (user) await supabase.from('ingredients').insert([formatForDB(newItem)]);
  };

  // 操作：减少数量 -1
  const decreaseCountByOne = async (name) => {
    const itemToUpdate = ingredients.find(i => i.name === name);
    if (!itemToUpdate) return;
    const isLastOne = itemToUpdate.amount <= 1;

    setIngredients(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(i => i.id === itemToUpdate.id);
      if (isLastOne) copy.splice(idx, 1);
      else copy[idx] = { ...itemToUpdate, amount: itemToUpdate.amount - 1 };
      return copy;
    });

    if (user) {
      if (isLastOne) await supabase.from('ingredients').delete().eq('id', itemToUpdate.id);
      else await supabase.from('ingredients').update({ amount: itemToUpdate.amount - 1 }).eq('id', itemToUpdate.id);
    }
  };

  // 操作：手动添加（含分类逻辑）
  const addIngredient = async () => {
    if (!newIngredient.name || !newIngredient.amount) return;
    const name = newIngredient.name.trim();
    const newItem = { ...newIngredient, id: crypto.randomUUID(), name };

    // 更新自定义模板（如果名字相同，覆盖分类）
    setCustomTemplates(prev => {
      const rest = prev.filter(t => t.name !== name);
      return [...rest, { 
        name, unit: newItem.unit, shelfLife: newItem.shelfLife, 
        storage: newItem.storage, category: newItem.category 
      }];
    });

    setIngredients(prev => [...prev, newItem]);

    if (user) {
      const { error } = await supabase.from('ingredients').insert([formatForDB(newItem)]);
      if (error) console.error("同步失败:", error.message);
    }

    setNewIngredient({ name: '', amount: '', unit: '个', purchaseDate: getTodayDate(), storage: 'fridge', shelfLife: 7, category: '其他' });
    setShowAddForm(false);
  };

  // 模板分组逻辑
  const groupedTemplates = useMemo(() => {
    const groups = {};
    allTemplates.forEach(t => {
      const c = t.category || '其他';
      if (!groups[c]) groups[c] = [];
      groups[c].push(t);
    });
    const order = ['肉类', '蔬菜', '水果', '蛋类', '乳制品', '饮料', '主食', '调味', '其他'];
    const ordered = {};
    order.forEach(k => { if (groups[k]) ordered[k] = groups[k]; });
    return ordered;
  }, [allTemplates]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2">添加食材</h2>
          <p className="text-gray-500 mb-8">管理你的云端冰箱库存</p>

          {/* 食物版展示 */}
          <div className="space-y-10">
            {Object.entries(groupedTemplates).map(([category, items]) => (
              <div key={category}>
                <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((template, idx) => {
                    const count = getCount(template.name);
                    const isAdded = count > 0;
                    return (
                      <div key={idx} className="relative group">
                        <button
                          onClick={() => onAddTemplate(template)}
                          className={`w-full p-4 border-2 rounded-2xl text-left transition-all duration-200 ${
                            isAdded ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200 hover:bg-white'
                          }`}
                        >
                          <div className="font-bold text-gray-800">{template.name}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{template.storage === 'fridge' ? '❄️ 冷藏' : '🧊 冷冻'} · {template.shelfLife}天</div>
                          
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            {isAdded && <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-lg">{count}</span>}
                            <button
                              onClick={(e) => { e.stopPropagation(); if (count > 0) decreaseCountByOne(template.name); }}
                              className={`p-1 rounded-full border transition-colors ${count > 0 ? 'text-blue-600 border-blue-200 hover:bg-blue-200' : 'text-gray-200 border-gray-100'}`}
                            >
                              <Minus size={14} />
                            </button>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 手动添加表单 */}
          <div className="mt-12 border-t border-gray-100 pt-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-bold"
            >
              {showAddForm ? '收起表单' : <><Plus size={20} /> 手动输入新食材</>}
            </button>

            {showAddForm && (
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl space-y-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">食材名称</label>
                    <input
                      placeholder="例如：波士顿龙虾"
                      value={newIngredient.name}
                      onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      className="w-full p-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">数量 & 单位</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="数量"
                        value={newIngredient.amount}
                        onChange={e => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                        className="flex-1 p-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <select 
                        value={newIngredient.unit}
                        onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                        className="w-24 p-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option>个</option><option>g</option><option>ml</option><option>盒</option><option>包</option>
                      </select>
                    </div>
                  </div>

                  {/* ⭐ 重点：重新归位的分类下拉框 */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">食品类型</label>
                    <select
                      value={newIngredient.category}
                      onChange={e => setNewIngredient({ ...newIngredient, category: e.target.value })}
                      className="w-full p-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
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

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">保存方式</label>
                    <select
                      value={newIngredient.storage}
                      onChange={e => setNewIngredient({ ...newIngredient, storage: e.target.value })}
                      className="w-full p-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="fridge">❄️ 冷藏</option>
                      <option value="freezer">🧊 冷冻</option>
                      <option value="pantry">🏠 常温</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={addIngredient}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  添加到冰箱
                </button>
              </div>
            )}
          </div>

          <div className="mt-12 flex gap-4">
            <button
              onClick={onComplete}
              className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all"
            >
              完成设置，进入主页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IngredientsPage;