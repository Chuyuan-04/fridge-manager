import React from 'react';
import { TrendingUp } from 'lucide-react';
import FridgePanel from './FridgePanel';
import RecipePanel from './RecipePanel';
import { getDaysLeft } from '../utils/dateUtils';

function MainPage({ ingredients, setIngredients, preferences, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">🧊 我的冰箱</h1>
          <div className="flex gap-4 text-sm">
            <button className="text-gray-600 hover:text-gray-800 transition">设置</button>
            <button className="text-gray-600 hover:text-gray-800 transition">统计</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: My Fridge */}
          <FridgePanel 
            ingredients={ingredients}
            setIngredients={setIngredients}
            onBack={onBack}
          />

          {/* Right: Recipe Recommendations */}
          <RecipePanel 
            ingredients={ingredients}
            setIngredients={setIngredients}
            preferences={preferences}
          />
        </div>

        {/* Quick Stats */}
        {ingredients.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-purple-600" />
              快速统计
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {ingredients.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">当前食材</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {ingredients.filter(i => getDaysLeft(i.purchaseDate, i.shelfLife) <= 3).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">即将过期</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {ingredients.filter(i => getDaysLeft(i.purchaseDate, i.shelfLife) > 7).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">新鲜食材</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;