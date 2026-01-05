export const getDaysLeft = (purchaseDate, shelfLife) => {
  const purchase = new Date(purchaseDate);
  const today = new Date();
  const diff = Math.ceil(
    (purchase.getTime() + shelfLife * 24 * 60 * 60 * 1000 - today.getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  return diff;
};

export const getStatusColor = (daysLeft) => {
  if (daysLeft <= 1) return 'bg-red-100 border-red-300 text-red-800';
  if (daysLeft <= 3) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  return 'bg-green-100 border-green-300 text-green-800';
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};