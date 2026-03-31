import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';

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

    if (!authLoading && user?.role === 'buyer') {
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
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'buyer') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              My Favorites
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              View and manage products you saved for later.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/products"
              className="bg-gray-100 px-4 py-2 rounded-md"
            >
              Browse Products
            </Link>
            <Link
              to="/cart"
              className="bg-gray-100 px-4 py-2 rounded-md"
            >
              Cart
            </Link>
            <Link
              to="/orders"
              className="bg-gray-100 px-4 py-2 rounded-md"
            >
              Orders
            </Link>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading favorites...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
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
