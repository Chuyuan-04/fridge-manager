import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { mockRecipes } from '../utils/templates';
import { getDaysLeft } from '../utils/dateUtils';

function RecipePanel({ ingredients, setIngredients }) {
  const [sessionPrefs, setSessionPrefs] = useState({
    speed: 'normal',
    people: 2,
    mood: '',
    period: false,
    showPlate: false,
    calories: false
  });
  const [recipes, setRecipes] = useState([]);

const generateRecipes = () => {
    // 1. 过滤出即将过期的食材
    const expiringSoon = ingredients
      .filter(i => getDaysLeft(i.purchaseDate, i.shelfLife) <= 3)
      .map(i => i.name);

    // 2. 这里的推荐逻辑不再是“全有才显示”，而是计算匹配度
    const availableRecipes = mockRecipes.map(recipe => {
      // 找出你已经拥有的食材
      const owned = recipe.ingredients.filter(reqIng => 
        ingredients.some(myIng => myIng.name === reqIng.name && myIng.amount >= reqIng.recommended)
      );
      
      // 找出你还缺少的食材
      const missing = recipe.ingredients.filter(reqIng => 
        !ingredients.some(myIng => myIng.name === reqIng.name && myIng.amount >= reqIng.recommended)
      );

      // 计算匹配分数 (0 到 1 之间)
      const matchScore = owned.length / recipe.ingredients.length;

      return { 
        ...recipe, 
        matchScore, 
        missingIngredients: missing,
        reason: expiringSoon.some(name => recipe.ingredients.map(i => i.name).includes(name)) 
                ? '优先消耗快过期食材' : '营养均衡推荐'
      };
    });

    // 3. 只要匹配到一个食材就显示，并按匹配度排序
    setRecipes(availableRecipes
      .filter(r => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
    );
  };

  const completeRecipe = (recipe) => {
  // 使用 optional chaining (?.) 或者先判断是否存在
  if (!recipe || !recipe.ingredients) {
    console.error("菜谱数据异常", recipe);
    return;
  }

  recipe.ingredients.forEach(ing => { 
      const ingredient = ingredients.find(i => i.name === ing.name);
      if (ingredient && ing.actual > 0) {
        setIngredients(prev =>
          prev.map(item => {
            if (item.id === ingredient.id) {
              const newAmount = item.amount - ing.actual;
              return newAmount <= 0 ? null : { ...item, amount: newAmount };
            }
            return item;
          }).filter(Boolean)
        );
      }
    });
    alert(`✅ 完成了「${recipe.name}」！食材已自动扣除`);
    setRecipes([]);
  };

  const updateIngredientAmount = (recipeId, ingIndex, value) => {
    setRecipes(prev =>
      prev.map(recipe => {
        if (recipe.id === recipeId) {
          const newIngredients = [...recipe.ingredients];
          newIngredients[ingIndex] = {
            ...newIngredients[ingIndex],
            actual: parseFloat(value) || 0
          };
          return { ...recipe, ingredients: newIngredients };
        }
        return recipe;
      })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ChefHat className="text-green-600" />
        今天吃什么
      </h2>

      {recipes.length === 0 ? (
        <div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">速度偏好</label>
              <div className="flex gap-2">
                {[
                  { value: 'quick', label: '⏱ 快手' },
                  { value: 'normal', label: '🍳 不限' },
                  { value: 'slow', label: '🥘 慢慢做' }
                ].map(speed => (
                  <button
                    key={speed.value}
                    onClick={() => setSessionPrefs({...sessionPrefs, speed: speed.value})}
                    className={`flex-1 py-2 rounded transition ${
                      sessionPrefs.speed === speed.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">几个人吃</label>
              <input
                type="number"
                min="1"
                max="10"
                value={sessionPrefs.people}
                onChange={e => setSessionPrefs({...sessionPrefs, people: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">心情</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'stressed', label: '😤 压力大', desc: '推荐脆口' },
                  { value: 'sad', label: '😔 难过', desc: '推荐甜口' },
                  { value: 'happy', label: '😊 开心', desc: '随意' },
                  { value: '', label: '😐 普通', desc: '常规推荐' }
                ].map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setSessionPrefs({...sessionPrefs, mood: mood.value})}
                    className={`p-2 rounded text-left text-sm transition ${
                      sessionPrefs.mood === mood.value
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{mood.label}</div>
                    <div className="text-xs text-gray-500">{mood.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sessionPrefs.showPlate}
                  onChange={e => setSessionPrefs({...sessionPrefs, showPlate: e.target.checked})}
                  className="w-4 h-4"
                />
                显示餐盘理论
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sessionPrefs.calories}
                  onChange={e => setSessionPrefs({...sessionPrefs, calories: e.target.checked})}
                  className="w-4 h-4"
                />
                关注卡路里
              </label>
            </div>
          </div>

          <button
            onClick={generateRecipes}
            disabled={ingredients.length === 0}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {ingredients.length === 0 ? '请先添加食材' : '🎲 生成菜谱推荐'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              为你推荐 {recipes.length} 道菜
            </div>
            <button
              onClick={() => setRecipes([])}
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              重新生成
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {recipes.map(recipe => (
              <div key={recipe.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition">
                <div className="flex items-start gap-4 mb-3">
                  <div className="text-5xl">{recipe.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{recipe.name}</h3>
                    <div className="flex gap-3 text-xs text-gray-600 mb-2">
                      <span>⏱ {recipe.time}</span>
                      <span>📊 {recipe.difficulty}</span>
                    </div>
                    <div className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full inline-block">
                      💡 {recipe.reason}
                    </div>
                  </div>
                </div>

                {/* 在菜谱卡片循环中添加 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.ingredients.map((ing, idx) => {
                    const isOwned = ingredients.some(i => i.name === ing.name && i.amount >= ing.recommended);
                    return (
                      <span key={idx} className={`text-xs px-2 py-1 rounded ${
                        isOwned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 line-through'
                      }`}>
                        {ing.name} {ing.recommended}{ing.unit}
                      </span>
                    );
                  })}
                </div>

                {recipe.missingIngredients.length > 0 && (
                  <p className="text-xs text-orange-600 mb-3">
                    ⚠️ 还缺: {recipe.missingIngredients.map(i => i.name).join(', ')}
                  </p>
                )}

                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">步骤：</div>
                  <ol className="text-sm text-gray-600 space-y-1">
                    {recipe.steps.map((step, idx) => (
                      <li key={idx}>{idx + 1}. {step}</li>
                    ))}
                  </ol>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">食材用量：</div>
                  <div className="space-y-2">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <div className="w-32 text-gray-600">
                          {ing.name}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="text-gray-500">
                            推荐: {ing.recommended}{ing.unit}
                          </div>
                          <div className="text-gray-400">→</div>
                          <input
                            type="number"
                            placeholder="实际用量"
                            value={ing.actual || ''}
                            onChange={e => updateIngredientAmount(recipe.id, idx, e.target.value)}
                            className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <span className="text-gray-500">{ing.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => completeRecipe(recipe)}
                  disabled={!recipe.ingredients.every(ing => ing.actual > 0)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  ✅ 我做了这道菜
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipePanel;