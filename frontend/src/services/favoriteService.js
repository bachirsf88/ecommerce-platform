import api, { TOKEN_KEY } from './api';

const FAVORITE_PRODUCT_IDS_KEY = 'favorite_product_ids';

let favoriteIdsRequest = null;

const readFavoriteProductIds = () => {
  const storedIds = localStorage.getItem(FAVORITE_PRODUCT_IDS_KEY);

  if (storedIds === null) {
    return null;
  }

  try {
    const parsedIds = JSON.parse(storedIds);

    return Array.isArray(parsedIds) ? parsedIds : [];
  } catch {
    return [];
  }
};

const saveFavoriteProductIds = (productIds) => {
  localStorage.setItem(
    FAVORITE_PRODUCT_IDS_KEY,
    JSON.stringify([...new Set(productIds.map((id) => Number(id)))])
  );
};

const favoriteService = {
  async getFavorites() {
    const response = await api.get('/favorites');
    const favorites = response.data.data ?? [];

    saveFavoriteProductIds(favorites.map((product) => product.id));

    return favorites;
  },

  async addFavorite(productId) {
    const response = await api.post('/favorites', {
      product_id: Number(productId),
    });

    this.addFavoriteProductId(productId);

    return response.data.data ?? null;
  },

  async removeFavorite(productId) {
    const response = await api.delete(`/favorites/${productId}`);

    this.removeFavoriteProductId(productId);

    return response.data.data ?? null;
  },

  async getFavoriteProductIds(forceRefresh = false) {
    if (!localStorage.getItem(TOKEN_KEY)) {
      this.clearFavoriteProductIds();
      return [];
    }

    const cachedIds = readFavoriteProductIds();

    if (!forceRefresh && cachedIds !== null) {
      return cachedIds;
    }

    if (!favoriteIdsRequest) {
      favoriteIdsRequest = this.getFavorites()
        .then((favorites) => favorites.map((product) => Number(product.id)))
        .finally(() => {
          favoriteIdsRequest = null;
        });
    }

    return favoriteIdsRequest;
  },

  addFavoriteProductId(productId) {
    const currentIds = readFavoriteProductIds() ?? [];
    saveFavoriteProductIds([...currentIds, Number(productId)]);
  },

  removeFavoriteProductId(productId) {
    const currentIds = readFavoriteProductIds() ?? [];
    saveFavoriteProductIds(
      currentIds.filter((id) => String(id) !== String(productId))
    );
  },

  clearFavoriteProductIds() {
    localStorage.removeItem(FAVORITE_PRODUCT_IDS_KEY);
  },
};

export default favoriteService;
