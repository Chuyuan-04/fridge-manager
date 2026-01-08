export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// ✅ freezer：视为“永久冷冻”，直接给一个很大的剩余天数
export const getDaysLeft = (purchaseDate, shelfLife, storage = 'fridge') => {
  const s = storage || 'fridge';
  if (s === 'freezer') return 9999;

  const purchase = new Date(purchaseDate);
  const today = new Date();

  const life = Number(shelfLife) || 0;
  const expiry = purchase.getTime() + life * 24 * 60 * 60 * 1000;

  const diff = Math.ceil((expiry - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const getStatusColor = (daysLeft, storage = 'fridge') => {
  const s = storage || 'fridge';

  // freezer：蓝色系
  if (s === 'freezer') {
    return 'bg-blue-50 border-blue-200 text-blue-800';
  }

  if (daysLeft <= 1) return 'bg-red-100 border-red-300 text-red-800';
  if (daysLeft <= 3) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  return 'bg-green-100 border-green-300 text-green-800';
};
