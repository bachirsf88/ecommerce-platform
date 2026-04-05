import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';
import productService from '../services/productService';
import storeService from '../services/storeService';
import { resolveEntityImageUrl, resolveMediaUrl } from '../utils/media';
import { canAccessBuyerFeatures } from '../utils/roles';

const GALLERY_POSITIONS = [
  'center 16%',
  'center center',
  'center 78%',
  '82% center',
];

const isRenderableImageSrc = (value) =>
  typeof value === 'string' && /^(https?:\/\/|data:|\/)/i.test(value.trim());

const formatReviewDate = (value) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

function RatingMarks({ rating, muted = false }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= safeRating;

        return (
          <span
            key={value}
            className={`h-2 w-2 rounded-full ${
              filled
                ? muted
                  ? 'bg-[rgba(116,103,95,0.7)]'
                  : 'bg-[var(--color-secondary)]'
                : 'bg-[rgba(138,129,124,0.18)]'
            }`}
          />
        );
      })}
    </div>
  );
}

function ProductImage({ product, objectPosition = 'center center', compact = false }) {
  const imageSrc = resolveEntityImageUrl(product?.image_url, product?.image);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={product?.name || 'Product'}
        className="h-full w-full object-cover"
        style={{ objectPosition }}
      />
    );
  }

  if (product?.image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(241,235,229,0.96),rgba(228,217,208,0.9))] p-4">
        <p className={`text-center text-[rgba(2,2,2,0.5)] ${compact ? 'text-[10px] leading-4' : 'text-xs leading-6'}`}>
          {product.image}
        </p>
      </div>
    );
  }

  return (
    <img
      src={heroImage}
      alt={product?.name || 'Product'}
      className="h-full w-full object-cover"
      style={{ objectPosition }}
    />
  );
}

function RelatedProductTile({ product }) {
  return (
    <article className="group">
      <Link to={product?.id ? `/products/${product.id}` : '/products'}>
        <div className="overflow-hidden rounded-[0.9rem] bg-[linear-gradient(160deg,rgba(239,231,223,0.88),rgba(226,215,205,0.78))]">
          <div className="aspect-[0.9] overflow-hidden">
            <ProductImage product={product} objectPosition="center center" compact />
          </div>
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={product?.id ? `/products/${product.id}` : '/products'}>
            <h3 className="font-display text-[1.45rem] leading-none text-[var(--color-primary)]">
              {product?.name || 'Unnamed product'}
            </h3>
          </Link>
          <p className="mt-2 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[rgba(138,129,124,0.82)]">
            {product?.seller?.name || product?.seller_name || product?.category || 'Artisan'}
          </p>
        </div>

        <p className="whitespace-nowrap text-[0.86rem] text-[rgba(2,2,2,0.7)]">
          ${product?.price ?? 'N/A'}
        </p>
      </div>
    </article>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.76)] px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[rgba(96,86,80,0.88)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[rgba(96,86,80,0.82)]" />
      Verified
    </span>
  );
}

function ReviewItem({ review }) {
  const buyerName = review?.buyer?.name || 'Verified Buyer';
  const comment = review?.comment?.trim();

  return (
    <article className="border-b border-[rgba(138,129,124,0.12)] pb-6 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">{buyerName}</p>
          <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-[rgba(138,129,124,0.76)]">
            {formatReviewDate(review?.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RatingMarks rating={review?.rating} muted />
          <span className="text-[0.82rem] text-[rgba(28,24,21,0.72)]">
            {Number(review?.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>

      {comment ? (
        <p className="mt-4 max-w-[42rem] text-sm leading-7 text-[rgba(2,2,2,0.68)]">
          {comment}
        </p>
      ) : (
        <p className="mt-4 text-sm italic text-[rgba(112,100,92,0.76)]">
          Shared a rating without written feedback.
        </p>
      )}
    </article>
  );
}

function ProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [sellerStore, setSellerStore] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setSellerStore(null);

      try {
        const [productData, productsData] = await Promise.all([
          productService.getProductById(id),
          productService.getProducts(),
        ]);

        if (!isMounted) {
          return;
        }

        setProduct(productData);

        const nextRelatedProducts = (productsData ?? [])
          .filter((item) => String(item?.id) !== String(id))
          .filter((item) =>
            productData?.category ? item?.category === productData.category : true
          )
          .slice(0, 4);

        setRelatedProducts(nextRelatedProducts);

        const sellerLookupId = productData?.seller?.id ?? productData?.seller_id ?? null;

        if (!sellerLookupId) {
          setSellerStore(null);
          return;
        }

        try {
          const storeData = await storeService.getStoreBySellerId(sellerLookupId);

          if (isMounted) {
            setSellerStore(storeData);
          }
        } catch {
          if (isMounted) {
            setSellerStore(null);
          }
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteStatus = async () => {
      if (
        authLoading ||
        !isAuthenticated ||
        !canAccessBuyerFeatures(user) ||
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

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsError('');
      setReviewsData(null);

      try {
        const nextReviewsData = await productService.getProductReviews(id);

        if (isMounted) {
          setReviewsData(nextReviewsData);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (err.response?.status === 404) {
          setReviewsData({
            product_id: id,
            average_rating: null,
            review_count: 0,
            reviews: [],
          });
        } else {
          setReviewsError(err.response?.data?.message || 'Unable to load reviews right now.');
        }
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

    if (!canAccessBuyerFeatures(user)) {
      setCartError('This account cannot use personal shopping actions.');
      setCartMessage('');
      return;
    }

    setCartLoading(true);
    setCartError('');
    setCartMessage('');

    try {
      await cartService.addToCart({
        product_id: product.id,
        quantity,
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

    if (!canAccessBuyerFeatures(user)) {
      setFavoriteError('This account cannot use personal shopping actions.');
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

  const sellerName = product?.seller?.name || product?.seller_name || 'Marketplace Seller';
  const isVerifiedSeller = sellerStore?.seller?.status === 'approved';
  const categoryName = product?.category || 'Artisan';
  const stockCount = Number(product?.stock ?? 0);
  const statusLabel = stockCount > 0 ? 'In Stock' : 'Out of Stock';
  const averageRating = Number(reviewsData?.average_rating ?? 0);
  const reviewCount = Number(reviewsData?.review_count ?? 0);
  const reviews = reviewsData?.reviews ?? [];

  const galleryItems = useMemo(
    () =>
      GALLERY_POSITIONS.map((position, index) => ({
        id: index,
        position,
        label:
          index === 0
            ? 'Primary view'
            : index === 1
              ? 'Detail view'
              : index === 2
                ? 'Material view'
                : 'Profile view',
      })),
    []
  );

  const selectedImage = galleryItems[activeImageIndex] || galleryItems[0];

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-[1180px]">
          <div className="rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-8 text-sm text-[rgba(2,2,2,0.62)]">
            Loading product details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-[1180px]">
          <div className="rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-8">
            <p className="status-message status-error mb-4">{error}</p>
            <Link to="/products" className="topbar-link">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-[1180px]">
          <div className="rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-8">
            <p className="mb-4 text-sm text-[rgba(2,2,2,0.62)]">Product not found.</p>
            <Link to="/products" className="topbar-link">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-4">
          <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgba(188,184,177,0.88)]">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <span className="text-[var(--color-secondary)]">{categoryName}</span>
          </div>
        </section>

        <section className="pt-8">
          <div className="grid gap-8 xl:grid-cols-[4.5rem_minmax(0,1.05fr)_0.92fr] xl:items-start">
            <div className="order-2 flex gap-3 xl:order-1 xl:flex-col">
              {galleryItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveImageIndex(item.id)}
                  className={`group relative overflow-hidden rounded-[0.75rem] border ${activeImageIndex === item.id ? 'border-[rgba(2,2,2,0.48)]' : 'border-[rgba(138,129,124,0.16)]'} bg-[rgba(255,253,249,0.72)]`}
                >
                  <div className="h-[5.4rem] w-[4.25rem] overflow-hidden">
                    <ProductImage product={product} objectPosition={item.position} compact />
                  </div>
                </button>
              ))}
            </div>

            <div className="order-1 xl:order-2">
              <div className="overflow-hidden rounded-[1rem] bg-[linear-gradient(160deg,rgba(233,223,212,0.58),rgba(217,205,193,0.72))] shadow-[0_20px_40px_rgba(2,2,2,0.08)]">
                <div className="aspect-[0.78] overflow-hidden">
                  <ProductImage product={product} objectPosition={selectedImage.position} />
                </div>
              </div>
            </div>

            <div className="order-3 max-w-[24rem] xl:pt-6">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                {categoryName}
              </p>
              <h1 className="font-display mt-4 text-[3.25rem] leading-[0.9] text-[var(--color-primary)] sm:text-[4rem]">
                {product.name || 'Unnamed product'}
              </h1>
              <p className="mt-4 text-[1.05rem] text-[rgba(2,2,2,0.72)]">
                ${product.price ?? 'N/A'}
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                    Stock Status
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-[var(--color-secondary)]" />
                    <p className="text-sm text-[rgba(2,2,2,0.72)]">
                      {statusLabel} {stockCount > 0 ? `· ${stockCount} available` : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-[5.3rem_repeat(3,minmax(0,1fr))] gap-2">
                  <span className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                    Details
                  </span>
                  <div className="rounded-full border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.56)] px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    {categoryName}
                  </div>
                  <div className="rounded-full border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.56)] px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    {statusLabel}
                  </div>
                  <div className="rounded-full border border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.56)] px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    Handmade
                  </div>
                </div>

                <div className="grid grid-cols-[5.3rem_minmax(0,1fr)] items-center gap-3">
                  <span className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                    Quantity
                  </span>
                  <div className="grid grid-cols-[2.6rem_minmax(0,1fr)_2.6rem] overflow-hidden rounded-[0.2rem] border border-[rgba(138,129,124,0.2)]">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="border-r border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.72)] text-sm text-[var(--color-primary)]"
                    >
                      -
                    </button>
                    <div className="flex items-center justify-center bg-white text-sm text-[var(--color-primary)]">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="border-l border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.72)] text-sm text-[var(--color-primary)]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={cartLoading || stockCount <= 0}
                    className="btn-base btn-primary w-full rounded-[0.3rem]"
                  >
                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </button>

                  <button
                    type="button"
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    className="btn-base btn-outline w-full rounded-[0.3rem] border-[rgba(138,129,124,0.22)] bg-transparent"
                  >
                    {favoriteLoading
                      ? 'Saving...'
                      : isFavorite
                        ? 'Remove Favorite'
                        : 'Add to Favorites'}
                  </button>
                </div>

                {(cartMessage || cartError || favoriteMessage || favoriteError) && (
                  <div className="space-y-3">
                    {cartMessage && <p className="status-message status-success">{cartMessage}</p>}
                    {cartError && <p className="status-message status-error">{cartError}</p>}
                    {favoriteMessage && <p className="status-message status-success">{favoriteMessage}</p>}
                    {favoriteError && <p className="status-message status-error">{favoriteError}</p>}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 border-t border-[rgba(138,129,124,0.16)] pt-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-[rgba(224,175,160,0.22)]">
                      <img
                        src={resolveMediaUrl(sellerStore?.logo_image_url || sellerStore?.logo_url) || heroImage}
                        alt={sellerName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-primary)]">{sellerName}</p>
                        {isVerifiedSeller && <VerifiedBadge />}
                      </div>
                      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[rgba(138,129,124,0.82)]">
                        Seller Studio
                      </p>
                    </div>
                  </div>

                  {sellerStore?.id ? (
                    <Link
                      to={`/stores/${sellerStore.id}`}
                      className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]"
                    >
                      Visit Store
                    </Link>
                  ) : (
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(138,129,124,0.68)]">
                      Storefront Soon
                    </span>
                  )}
                </div>

                {isAuthenticated && canAccessBuyerFeatures(user) && (
                  <div className="flex flex-wrap gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                    <Link to="/cart">View Cart</Link>
                    <Link to="/favorites">Favorites</Link>
                    <Link to="/orders">Orders</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="grid gap-10 border-t border-[rgba(138,129,124,0.12)] pt-10 lg:grid-cols-3">
            <div className="max-w-[18rem]">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                The Narrative
              </p>
              <p className="font-display mt-5 text-[2rem] leading-[1.05] text-[var(--color-primary)]">
                “Each piece carries the quiet presence of careful making and a calm domestic rhythm.”
              </p>
            </div>

            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                Description
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[rgba(2,2,2,0.68)]">
                <p>
                  {product.description || 'This piece is presented as part of a curated artisan marketplace collection, balancing practical use with a softer editorial tone.'}
                </p>
                <p>
                  Designed for refined discovery, the page keeps the product at the center while preserving the quiet, image-led feeling of a premium handmade collection.
                </p>
              </div>
            </div>

            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                Material & Care
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[rgba(2,2,2,0.68)]">
                <p>
                  <span className="font-medium text-[var(--color-primary)]">Category:</span> {categoryName}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-primary)]">Availability:</span> {statusLabel}
                  {stockCount > 0 ? ` (${stockCount} in stock)` : ''}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-primary)]">Seller:</span> {sellerName}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-primary)]">Marketplace note:</span> Handmade products may feature subtle variations that make each piece feel individual.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="grid gap-10 border-t border-[rgba(138,129,124,0.12)] pt-10 lg:grid-cols-[0.38fr_0.62fr]">
            <div className="max-w-[18rem]">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                Reviews
              </p>
              <h2 className="font-display mt-5 text-[2.1rem] leading-[1.02] text-[var(--color-primary)]">
                Collected impressions from recent buyers.
              </h2>

              <div className="mt-6 flex items-end gap-4">
                <div>
                  <p className="font-display text-[3rem] leading-none text-[var(--color-primary)]">
                    {reviewsLoading ? '...' : reviewCount > 0 ? averageRating.toFixed(1) : '0.0'}
                  </p>
                  <p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-[rgba(138,129,124,0.78)]">
                    Average Rating
                  </p>
                </div>

                <div className="pb-1">
                  <RatingMarks rating={Math.round(averageRating)} />
                  <p className="mt-3 text-sm text-[rgba(2,2,2,0.66)]">
                    {reviewsLoading ? 'Loading reviews...' : `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`}
                  </p>
                </div>
              </div>
            </div>

            <div>
              {reviewsLoading ? (
                <div className="rounded-[1rem] border border-[rgba(138,129,124,0.12)] bg-[rgba(255,253,249,0.52)] px-6 py-7 text-sm text-[rgba(88,78,72,0.76)]">
                  Loading buyer impressions...
                </div>
              ) : reviewsError ? (
                <div className="rounded-[1rem] border border-[rgba(138,129,124,0.12)] bg-[rgba(255,253,249,0.52)] px-6 py-7 text-sm text-[rgba(88,78,72,0.76)]">
                  {reviewsError}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-[1rem] border border-[rgba(138,129,124,0.12)] bg-[rgba(255,253,249,0.52)] px-6 py-7">
                  <p className="font-display text-[1.85rem] leading-none text-[var(--color-primary)]">
                    No reviews yet.
                  </p>
                  <p className="mt-4 max-w-[32rem] text-sm leading-7 text-[rgba(88,78,72,0.8)]">
                    Be the first to share feedback after purchase.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.88)]">
                Related Pieces
              </p>
              <h2 className="font-display mt-3 text-[2.2rem] leading-none text-[var(--color-primary)]">
                From the Collection
              </h2>
            </div>

            <Link
              to="/products"
              className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]"
            >
              View All Products
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <div className="rounded-[1rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(255,253,249,0.55)] p-6 text-sm text-[rgba(2,2,2,0.62)]">
              More products from the marketplace will appear here soon.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <RelatedProductTile key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-20 bg-[linear-gradient(180deg,#151210,#0d0b0a)] pb-10 pt-16 text-[#f6f1eb]">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-display text-4xl leading-none text-white sm:text-5xl">
                GradShop
              </p>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[rgba(255,250,247,0.68)]">
                A refined artisan marketplace for women-led home businesses, thoughtful product discovery, and handmade pieces presented with warmth and restraint.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                  Discover
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Home</Link>
                  <Link to="/products" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Products</Link>
                  <Link to="/register" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Register</Link>
                </div>
              </div>

              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                  Client Care
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/login" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Login</Link>
                  <Link to="/cart" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Cart</Link>
                  <Link to="/favorites" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Favorites</Link>
                </div>
              </div>

              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[rgba(255,250,247,0.42)]">
                  Newsletter
                </p>
                <div className="mt-4 space-y-3">
                  <p className="text-sm leading-6 text-[rgba(255,250,247,0.68)]">
                    Join for artisan updates and thoughtful new arrivals.
                  </p>
                  <div className="border-b border-[rgba(255,250,247,0.18)] pb-3 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(255,250,247,0.56)]">
                    Email Address
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProductDetailsPage;
