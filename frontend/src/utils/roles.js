export function canAccessBuyerFeatures(user) {
  return user?.role === 'buyer' || user?.role === 'seller';
}

export function isSeller(user) {
  return user?.role === 'seller';
}
