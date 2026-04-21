import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';
import { canAccessBuyerFeatures } from '../utils/roles';

function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await favoriteService.getFavorites();
        setFavorites(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load favorites.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && canAccessBuyerFeatures(user)) {
      loadFavorites();
    }
  }, [authLoading, user]);

  const handleFavoriteChange = (productId, nextIsFavorite) => {
    if (nextIsFavorite) {
      return;
    }

    setFavorites((previousFavorites) =>
      previousFavorites.filter(
        (favorite) => String(favorite.id) !== String(productId)
      )
    );
  };

  if (authLoading) {
    return (
      <div className="page-shell">
        <div className="page-container surface-card p-6 text-sm text-[var(--color-text-soft)]">
          Checking user...
        </div>
      </div>
    );
  }

  if (!canAccessBuyerFeatures(user)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="surface-card-strong mb-6 flex flex-wrap items-center justify-between gap-4 px-6 py-7">
          <div>
            <span className="section-label">Personal Favorites</span>
            <h1 className="section-title mt-4">My Favorites</h1>
            <p className="subtle-copy mt-2 text-sm">
              View and manage products you saved for later.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/products" className="btn-base btn-outline">
              Browse Products
            </Link>
            <Link to="/cart" className="btn-base btn-outline">
              Cart
            </Link>
            <Link to="/orders" className="btn-base btn-outline">
              Orders
            </Link>
          </div>
        </div>

        {loading && (
          <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">
            Loading favorites...
          </div>
        )}

        {error && (
          <div className="status-message status-error">
            {error}
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="empty-state">
            You have no favorite products yet.
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
