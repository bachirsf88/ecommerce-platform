import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';
import productService from '../services/productService';

function ProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteStatus = async () => {
      if (
        authLoading ||
        !isAuthenticated ||
        user?.role !== 'buyer' ||
        !product?.id
      ) {
        setIsFavorite(false);
        return;
      }

      try {
        const favoriteProductIds = await favoriteService.getFavoriteProductIds();

        if (isMounted) {
          setIsFavorite(
            favoriteProductIds.some((favoriteId) => String(favoriteId) === String(product.id))
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
  }, [authLoading, isAuthenticated, product, user]);

  const handleAddToCart = async () => {
    if (!product?.id) {
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
        product_id: product.id,
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
    if (!product?.id) {
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
        await favoriteService.removeFavorite(product.id);
        setIsFavorite(false);
        setFavoriteMessage('Product removed from favorites.');
      } else {
        await favoriteService.addFavorite(product.id);
        setIsFavorite(true);
        setFavoriteMessage('Product added to favorites.');
      }
    } catch (err) {
      setFavoriteError(
        err.response?.data?.message || 'Failed to update favorites.'
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-8 text-sm text-slate-600 shadow-sm">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <Link to="/products" className="text-sm font-medium text-sky-700 underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm text-slate-600">Product not found.</p>
          <Link to="/products" className="text-sm font-medium text-sky-700 underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex gap-2 items-center justify-between flex-wrap">
          <Link
            to="/products"
            className="bg-gray-100 px-4 py-2 rounded-md"
          >
            Back to Products
          </Link>
          {isAuthenticated && user?.role === 'buyer' && (
            <div className="flex gap-2">
              <Link to="/favorites" className="bg-gray-100 px-4 py-2 rounded-md">
                Favorites
              </Link>
              <Link to="/cart" className="bg-gray-100 px-4 py-2 rounded-md">
                Cart
              </Link>
              <Link to="/orders" className="bg-gray-100 px-4 py-2 rounded-md">
                Orders
              </Link>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 sm:h-96">
              {product.image ? (
                <p className="max-w-md px-6 text-center text-sm text-slate-500 break-all">
                  {product.image}
                </p>
              ) : (
                <div className="text-center">
                  <p className="text-base font-medium text-slate-500">No image available</p>
                  <p className="mt-1 text-sm text-slate-400">Product preview will appear here</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              {product.category || 'Uncategorized'}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {product.name || 'Unnamed product'}
            </h1>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Price</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                ${product.price ?? 'N/A'}
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md w-full"
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                className="bg-gray-100 px-4 py-2 rounded-md w-full"
              >
                {favoriteLoading
                  ? 'Saving...'
                  : isFavorite
                    ? 'Remove Favorite'
                    : 'Add to Favorites'}
              </button>
            </div>

            {isAuthenticated && user?.role === 'buyer' && (
              <div className="mt-4">
                <Link
                  to="/favorites"
                  className="bg-gray-100 px-4 py-2 rounded-md w-full text-center"
                >
                  View Favorites
                </Link>
              </div>
            )}

            {isAuthenticated && user?.role === 'buyer' && (
              <div className="mt-4">
                <Link
                  to="/cart"
                  className="bg-gray-100 px-4 py-2 rounded-md w-full text-center inline-block"
                >
                  View Cart
                </Link>
              </div>
            )}

            {cartMessage && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {cartMessage}
              </div>
            )}

            {cartError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {cartError}
              </div>
            )}

            {favoriteMessage && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {favoriteMessage}
              </div>
            )}

            {favoriteError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {favoriteError}
              </div>
            )}

            <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
              <div>
                <p className="font-medium text-slate-900">Description</p>
                <p className="mt-1">
                  {product.description || 'No description available.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Stock</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {product.stock ?? 'N/A'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                  <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                    {product.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
