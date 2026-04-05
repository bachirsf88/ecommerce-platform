import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';
import { resolveEntityImageUrl } from '../utils/media';
import { canAccessBuyerFeatures } from '../utils/roles';

function ProductCard({ product, onFavoriteChange }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const productId = product?.id;
  const productName = product?.name || 'Unnamed product';
  const productCategory = product?.category || 'Uncategorized';
  const productPrice = product?.price ?? 'N/A';
  const productStock = product?.stock ?? 'N/A';
  const productImageSrc = resolveEntityImageUrl(product?.image_url, product?.image);
  const buyerAccess = canAccessBuyerFeatures(user);
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
        !buyerAccess ||
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
  }, [authLoading, buyerAccess, isAuthenticated, productId]);

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

    if (!buyerAccess) {
      setCartError('This account cannot use personal shopping actions.');
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

    if (!buyerAccess) {
      setFavoriteError('This account cannot use personal shopping actions.');
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
    <article className="surface-card flex h-full flex-col p-5">
      <div className="product-media mb-5 flex h-52 items-center justify-center overflow-hidden p-6">
        {productImageSrc ? (
          <img
            src={productImageSrc}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={heroImage}
            alt={productName}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="status-pill">
          {productCategory}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(138,129,124,0.82)]">
          Stock: {productStock}
        </span>
      </div>

      <h3 className="font-display text-3xl leading-none text-[var(--color-primary)]">
        {productName}
      </h3>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-secondary)]">Price</p>
          <p className="mt-1 text-2xl font-extrabold text-[var(--color-primary)]">${productPrice}</p>
        </div>
      </div>

      {cartMessage && (
        <p className="status-message status-success mt-4">
          {cartMessage}
        </p>
      )}

      {cartError && (
        <p className="status-message status-error mt-4">
          {cartError}
        </p>
      )}

      {favoriteMessage && (
        <p className="status-message status-success mt-4">
          {favoriteMessage}
        </p>
      )}

      {favoriteError && (
        <p className="status-message status-error mt-4">
          {favoriteError}
        </p>
      )}

      <div className="mt-6 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartLoading || !productId}
            className="btn-base btn-primary w-full"
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>

          <button
            type="button"
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading || !productId}
            className="btn-base btn-secondary w-full"
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
            className="btn-base btn-outline w-full"
          >
            View Details
          </Link>
        ) : (
          <p className="text-sm text-[var(--color-danger-text)]">Product details are unavailable.</p>
        )}

        {isAuthenticated && buyerAccess && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/favorites"
              className="btn-base btn-outline w-full"
            >
              Favorites
            </Link>
            <Link
              to="/cart"
              className="btn-base btn-outline w-full"
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
