import React from 'react';
import { Clock, Plus } from 'lucide-react';
import IngredientCard from './IngredientCard';
import { getDaysLeft } from '../utils/dateUtils';

function FridgePanel({ ingredients, setIngredients, onBack }) {
  const updateAmount = (id, delta) => {
    setIngredients(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newAmount = item.amount + delta;
          return newAmount <= 0 ? null : { ...item, amount: newAmount };
        }
        return item;
      }).filter(Boolean)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="text-blue-600" />
          我的冰箱
        </h2>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm transition"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🧊</div>
          <p>冰箱空空如也</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-700 transition"
          >
            添加第一个食材 →
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {ingredients
            .sort((a, b) => 
              getDaysLeft(a.purchaseDate, a.shelfLife) - 
              getDaysLeft(b.purchaseDate, b.shelfLife)
            )
            .map(item => (
              <IngredientCard
                key={item.id}
                item={item}
                onUpdateAmount={updateAmount}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default FridgePanel;