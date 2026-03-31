import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';

function ProductCard({ product, onFavoriteChange }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const productId = product?.id;
  const productName = product?.name || 'Unnamed product';
  const productCategory = product?.category || 'Uncategorized';
  const productPrice = product?.price ?? 'N/A';
  const productStock = product?.stock ?? 'N/A';
  const [cartLoading, setCartLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [favoriteError, setFavoriteError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteStatus = async () => {
      if (
        authLoading ||
        !isAuthenticated ||
        user?.role !== 'buyer' ||
        !productId
      ) {
        setIsFavorite(false);
        return;
      }

      try {
        const favoriteProductIds = await favoriteService.getFavoriteProductIds();

        if (isMounted) {
          setIsFavorite(
            favoriteProductIds.some((id) => String(id) === String(productId))
          );
        }
      } catch {
        if (isMounted) {
          setIsFavorite(false);
        }
      }
    };

    loadFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, productId, user]);

  const handleAddToCart = async () => {
    if (!productId) {
      setCartError('Product is unavailable.');
      setCartMessage('');
      return;
    }

    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'buyer') {
      setCartError('Only buyers can add products to cart.');
      setCartMessage('');
      return;
    }

    setCartLoading(true);
    setCartError('');
    setCartMessage('');

    try {
      await cartService.addToCart({
        product_id: productId,
        quantity: 1,
      });

      setCartMessage('Product added to cart successfully.');
    } catch (err) {
      setCartError(err.response?.data?.message || 'Failed to add product to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!productId) {
      setFavoriteError('Product is unavailable.');
      setFavoriteMessage('');
      return;
    }

    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'buyer') {
      setFavoriteError('Only buyers can manage favorites.');
      setFavoriteMessage('');
      return;
    }

    setFavoriteLoading(true);
    setFavoriteError('');
    setFavoriteMessage('');

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(productId);
        setIsFavorite(false);
        setFavoriteMessage('Product removed from favorites.');
        onFavoriteChange?.(productId, false);
      } else {
        await favoriteService.addFavorite(productId);
        setIsFavorite(true);
        setFavoriteMessage('Product added to favorites.');
        onFavoriteChange?.(productId, true);
      }
    } catch (err) {
      setFavoriteError(
        err.response?.data?.message || 'Failed to update favorites.'
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex h-44 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
        {product?.image ? (
          <p className="px-4 text-center text-xs text-slate-500 break-all">
            {product.image}
          </p>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">No image</p>
            <p className="mt-1 text-xs text-slate-400">Product preview unavailable</p>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          {productCategory}
        </span>
        <span className="text-xs text-slate-400">Stock: {productStock}</span>
      </div>

      <h3 className="text-xl font-bold text-slate-900">
        {productName}
      </h3>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Price</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">${productPrice}</p>
        </div>
      </div>

      {cartMessage && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {cartMessage}
        </p>
      )}

      {cartError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {cartError}
        </p>
      )}

      {favoriteMessage && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {favoriteMessage}
        </p>
      )}

      {favoriteError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {favoriteError}
        </p>
      )}

      <div className="mt-6 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartLoading || !productId}
            className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>

          <button
            type="button"
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading || !productId}
            className="rounded-md border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            {favoriteLoading
              ? 'Saving...'
              : isFavorite
                ? 'Remove Favorite'
                : 'Add to Favorites'}
          </button>
        </div>

        {productId ? (
          <Link
            to={`/products/${productId}`}
            className="rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
          >
            View Details
          </Link>
        ) : (
          <p className="text-sm text-red-600">Product details are unavailable.</p>
        )}

        {isAuthenticated && user?.role === 'buyer' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/favorites"
              className="rounded-md border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700"
            >
              Favorites
            </Link>
            <Link
              to="/cart"
              className="rounded-md border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700"
            >
              Cart
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
