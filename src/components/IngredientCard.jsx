import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { getDaysLeft, getStatusColor } from '../utils/dateUtils';

function IngredientCard({ item, onUpdateAmount }) {
  const daysLeft = getDaysLeft(item.purchaseDate, item.shelfLife);
  const statusColor = getStatusColor(daysLeft);

  const getStorageIcon = (storage) => {
    switch (storage) {
      case 'freezer': return '❄️';
      case 'fridge': return '🧊';
      case 'room': return '📦';
      default: return '📦';
    }
  };

  const getDaysText = (days) => {
    if (days > 0) return `剩余 ${days} 天`;
    if (days === 0) return '今天到期';
    return '已过期';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {getStorageIcon(item.storage)}
          </div>
          <div>
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm opacity-75">
              {getDaysText(daysLeft)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{item.amount} {item.unit}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onUpdateAmount(item.id, -1)}
          className="flex-1 bg-white bg-opacity-50 hover:bg-opacity-75 py-2 rounded flex items-center justify-center gap-1 transition"
        >
          <Minus size={16} />
          用了
        </button>
        <button
          onClick={() => onUpdateAmount(item.id, 1)}
          className="flex-1 bg-white bg-opacity-50 hover:bg-opacity-75 py-2 rounded flex items-center justify-center gap-1 transition"
        >
          <Plus size={16} />
          补充
        </button>
      </div>
    </div>
  );
}

export default IngredientCard;