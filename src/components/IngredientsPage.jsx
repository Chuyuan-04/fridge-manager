import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { quickTemplates } from '../utils/templates';
import { getTodayDate } from '../utils/dateUtils';

function IngredientsPage({ ingredients, setIngredients, onComplete }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    amount: '',
    unit: '个',
    purchaseDate: getTodayDate(),
    storage: 'fridge',
    shelfLife: 7
  });

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount) return;
    
    setIngredients([...ingredients, {
      ...newIngredient,
      id: Date.now(),
      amount: parseFloat(newIngredient.amount)
    }]);
    
    setNewIngredient({
      name: '',
      amount: '',
      unit: '个',
      purchaseDate: getTodayDate(),
      storage: 'fridge',
      shelfLife: 7
    });
    setShowAddForm(false);
  };

  const addQuickTemplate = (template) => {
    setIngredients([...ingredients, {
      ...template,
      id: Date.now() + Math.random(),
      amount: 1,
      purchaseDate: getTodayDate()
    }]);
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">添加冰箱里的食材</h2>
          <p className="text-gray-600 mb-6 text-sm">不需要一次录完，之后随时可以添加</p>

          {/* 快速模板 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">快速添加（常见食材）</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => addQuickTemplate(template)}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition"
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">保质期 {template.shelfLife} 天</div>
                </button>
              ))}
            </div>
          </div>

          {/* 手动添加 */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition"
            >
              <Plus size={20} />
              手动添加食材
            </button>

            {showAddForm && (
              <div className="mt-4 p-4 border-2 border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    placeholder="食材名称"
                    value={newIngredient.name}
                    onChange={e => setNewIngredient({...newIngredient, name: e.target.value})}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="数量"
                      value={newIngredient.amount}
                      onChange={e => setNewIngredient({...newIngredient, amount: e.target.value})}
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newIngredient.unit}
                      onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})}
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
                    onChange={e => setNewIngredient({...newIngredient, purchaseDate: e.target.value})}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newIngredient.storage}
                    onChange={e => setNewIngredient({...newIngredient, storage: e.target.value})}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fridge">冷藏</option>
                    <option value="freezer">冷冻</option>
                    <option value="room">常温</option>
                  </select>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">保质期（天）</label>
                    <input
                      type="number"
                      value={newIngredient.shelfLife}
                      onChange={e => setNewIngredient({...newIngredient, shelfLife: parseInt(e.target.value)})}
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

          {/* 已添加的食材 */}
          {ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">已添加 ({ingredients.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ingredients.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 text-sm ml-2">
                        {item.amount} {item.unit}
                      </span>
                    </div>
                    <button
                      onClick={() => removeIngredient(item.id)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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