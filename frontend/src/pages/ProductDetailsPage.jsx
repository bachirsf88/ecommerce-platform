import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import artisanAvatarFallback from '../assets/artisan-avatar-fallback.png';
import fashionProductFallback from '../assets/fashion-product-fallback.jpg';
import productGalleryFallback from '../assets/product-gallery-fallback.jpg';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';
import productService from '../services/productService';
import storeService from '../services/storeService';
import {
  resolveMediaUrl,
  resolveProductGalleryImages,
  resolveProductPrimaryImage,
  resolveProductVideoUrl,
} from '../utils/media';
import { canAccessBuyerFeatures } from '../utils/roles';

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
                  ? 'bg-[var(--color-brand)]'
                  : 'bg-[var(--color-secondary)]'
                : 'bg-[rgba(188,184,177,0.34)]'
            }`}
          />
        );
      })}
    </div>
  );
}

function RelatedProductTile({ product }) {
  const imageSrc = resolveProductPrimaryImage(product, fashionProductFallback);

  return (
    <article className="group">
      <Link to={product?.id ? `/products/${product.id}` : '/products'}>
        <div className="overflow-hidden rounded-[0.9rem] bg-[linear-gradient(160deg,rgba(244,243,238,0.94),rgba(188,184,177,0.34))]">
          <div className="aspect-[0.9] overflow-hidden">
            <img
              src={imageSrc}
              alt={product?.name || 'Product'}
              className="h-full w-full object-cover"
            />
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
          <p className="page-kicker mt-2 text-[0.58rem]">
            {product?.seller?.name || product?.seller_name || product?.category || 'Artisan'}
          </p>
        </div>

        <p className="whitespace-nowrap text-[0.86rem] text-[var(--color-text-soft)]">
          ${product?.price ?? 'N/A'}
        </p>
      </div>
    </article>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
      Verified
    </span>
  );
}

function ReviewItem({ review }) {
  const buyerName = review?.buyer?.name || 'Verified Buyer';
  const comment = review?.comment?.trim();

  return (
    <article className="border-b border-[var(--color-border-soft)] pb-6 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">{buyerName}</p>
          <p className="page-kicker mt-1 text-[0.62rem]">
            {formatReviewDate(review?.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RatingMarks rating={review?.rating} muted />
          <span className="text-[0.82rem] text-[var(--color-text-soft)]">
            {Number(review?.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>

      {comment ? (
        <p className="mt-4 max-w-[42rem] text-sm leading-7 text-[var(--color-text-soft)]">
          {comment}
        </p>
      ) : (
        <p className="mt-4 text-sm italic text-[var(--color-text-faint)]">
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
  const galleryImages = useMemo(
    () => resolveProductGalleryImages(product, productGalleryFallback),
    [product]
  );
  const productVideoUrl = useMemo(() => resolveProductVideoUrl(product), [product]);
  const selectedImage = galleryImages[Math.min(activeImageIndex, Math.max(galleryImages.length - 1, 0))]
    || resolveProductPrimaryImage(product, productGalleryFallback);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id, product?.id]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-[1180px]">
          <div className="surface-card p-8 text-sm text-[var(--color-text-soft)]">
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
          <div className="surface-card p-8">
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
          <div className="surface-card p-8">
            <p className="mb-4 text-sm text-[var(--color-text-soft)]">Product not found.</p>
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
              {galleryImages.map((imageSrc, index) => (
                <button
                  key={`${imageSrc}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`group relative overflow-hidden rounded-[0.75rem] border ${activeImageIndex === index ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'} bg-[rgba(255,255,255,0.82)]`}
                >
                  <div className="h-[5.4rem] w-[4.25rem] overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={`${product.name || 'Product'} view ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="order-1 xl:order-2">
              <div className="image-shell rounded-[1rem] shadow-[0_20px_40px_rgba(138,129,124,0.16)]">
                <div className="aspect-[0.78] overflow-hidden">
                  <img
                    src={selectedImage}
                    alt={product?.name || 'Product'}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {productVideoUrl ? (
                <div className="mt-5 overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.78)] p-3 shadow-[0_18px_34px_rgba(138,129,124,0.1)]">
                  <p className="px-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
                    Product Video
                  </p>
                  <video
                    src={productVideoUrl}
                    controls
                    className="mt-3 aspect-video w-full rounded-[0.8rem] bg-[rgba(244,243,238,0.92)] object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="order-3 max-w-[24rem] xl:pt-6">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                {categoryName}
              </p>
              <h1 className="font-display mt-4 text-[3.25rem] leading-[0.9] text-[var(--color-text)] sm:text-[4rem]">
                {product.name || 'Unnamed product'}
              </h1>
              <p className="mt-4 text-[1.05rem] text-[var(--color-text-soft)]">
                ${product.price ?? 'N/A'}
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                    Stock Status
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-[var(--color-secondary)]" />
                    <p className="text-sm text-[var(--color-text-soft)]">
                      {statusLabel} {stockCount > 0 ? `· ${stockCount} available` : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-[5.3rem_repeat(3,minmax(0,1fr))] gap-2">
                  <span className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                    Details
                  </span>
                  <div className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)]">
                    {categoryName}
                  </div>
                  <div className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)]">
                    {statusLabel}
                  </div>
                  <div className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)]">
                    Handmade
                  </div>
                </div>

                <div className="grid grid-cols-[5.3rem_minmax(0,1fr)] items-center gap-3">
                  <span className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                    Quantity
                  </span>
                  <div className="grid grid-cols-[2.6rem_minmax(0,1fr)_2.6rem] overflow-hidden rounded-[0.2rem] border border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="border-r border-[var(--color-border)] bg-[rgba(244,243,238,0.92)] text-sm text-[var(--color-text)]"
                    >
                      -
                    </button>
                    <div className="flex items-center justify-center bg-[rgba(255,255,255,0.94)] text-sm text-[var(--color-text)]">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="border-l border-[var(--color-border)] bg-[rgba(244,243,238,0.92)] text-sm text-[var(--color-text)]"
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
                    className="btn-base btn-outline w-full rounded-[0.3rem] border-[var(--color-border-strong)] bg-transparent"
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

                <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border-soft)] pt-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
                      <img
                        src={resolveMediaUrl(sellerStore?.logo_image_url || sellerStore?.logo_url) || artisanAvatarFallback}
                        alt={sellerName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{sellerName}</p>
                        {isVerifiedSeller && <VerifiedBadge />}
                      </div>
                      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                        Seller Studio
                      </p>
                    </div>
                  </div>

                  {sellerStore?.id ? (
                    <Link
                      to={`/stores/${sellerStore.id}`}
                      className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]"
                    >
                      Visit Store
                    </Link>
                  ) : (
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                      Storefront Soon
                    </span>
                  )}
                </div>

                {isAuthenticated && canAccessBuyerFeatures(user) && (
                  <div className="flex flex-wrap gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
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
          <div className="grid gap-10 border-t border-[var(--color-border-soft)] pt-10 lg:grid-cols-3">
            <div className="max-w-[18rem]">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                The Narrative
              </p>
              <p className="font-display mt-5 text-[2rem] leading-[1.05] text-[var(--color-text)]">
                “Each piece carries the quiet presence of careful making and a calm domestic rhythm.”
              </p>
            </div>

            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                Description
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-text-soft)]">
                <p>
                  {product.description || 'This piece is presented as part of a curated artisan marketplace collection, balancing practical use with a softer editorial tone.'}
                </p>
                <p>
                  Designed for refined discovery, the page keeps the product at the center while preserving the quiet, image-led feeling of a premium handmade collection.
                </p>
              </div>
            </div>

            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                Material & Care
              </p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-text-soft)]">
                <p>
                  <span className="font-medium text-[var(--color-text)]">Category:</span> {categoryName}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-text)]">Availability:</span> {statusLabel}
                  {stockCount > 0 ? ` (${stockCount} in stock)` : ''}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-text)]">Seller:</span> {sellerName}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-text)]">Marketplace note:</span> Handmade products may feature subtle variations that make each piece feel individual.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="grid gap-10 border-t border-[var(--color-border-soft)] pt-10 lg:grid-cols-[0.38fr_0.62fr]">
            <div className="max-w-[18rem]">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                Reviews
              </p>
              <h2 className="font-display mt-5 text-[2.1rem] leading-[1.02] text-[var(--color-text)]">
                Collected impressions from recent buyers.
              </h2>

              <div className="mt-6 flex items-end gap-4">
                <div>
                  <p className="font-display text-[3rem] leading-none text-[var(--color-text)]">
                    {reviewsLoading ? '...' : reviewCount > 0 ? averageRating.toFixed(1) : '0.0'}
                  </p>
                  <p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                    Average Rating
                  </p>
                </div>

                <div className="pb-1">
                  <RatingMarks rating={Math.round(averageRating)} />
                  <p className="mt-3 text-sm text-[var(--color-text-soft)]">
                    {reviewsLoading ? 'Loading reviews...' : `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`}
                  </p>
                </div>
              </div>
            </div>

            <div>
              {reviewsLoading ? (
                <div className="soft-panel px-6 py-7 text-sm text-[var(--color-text-faint)]">
                  Loading buyer impressions...
                </div>
              ) : reviewsError ? (
                <div className="soft-panel px-6 py-7 text-sm text-[var(--color-text-faint)]">
                  {reviewsError}
                </div>
              ) : reviews.length === 0 ? (
                <div className="soft-panel px-6 py-7">
                  <p className="font-display text-[1.85rem] leading-none text-[var(--color-text)]">
                    No reviews yet.
                  </p>
                  <p className="mt-4 max-w-[32rem] text-sm leading-7 text-[var(--color-text-faint)]">
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
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                Related Pieces
              </p>
              <h2 className="font-display mt-3 text-[2.2rem] leading-none text-[var(--color-text)]">
                From the Collection
              </h2>
            </div>

            <Link
              to="/products"
              className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]"
            >
              View All Products
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <div className="soft-panel p-6 text-sm text-[var(--color-text-soft)]">
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

      <footer className="site-footer mt-20 pb-10 pt-16">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-display text-4xl leading-none text-white sm:text-5xl">
                GradShop
              </p>
              <p className="site-footer-copy mt-5 max-w-xl text-sm leading-7">
                A refined artisan marketplace for women-led home businesses, thoughtful product discovery, and handmade pieces presented with warmth and restraint.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="site-footer-label">
                  Discover
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/" className="site-footer-link text-sm">Home</Link>
                  <Link to="/products" className="site-footer-link text-sm">Products</Link>
                  <Link to="/register" className="site-footer-link text-sm">Register</Link>
                </div>
              </div>

              <div>
                <p className="site-footer-label">
                  Client Care
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/login" className="site-footer-link text-sm">Login</Link>
                  <Link to="/cart" className="site-footer-link text-sm">Cart</Link>
                  <Link to="/favorites" className="site-footer-link text-sm">Favorites</Link>
                </div>
              </div>

              <div>
                <p className="site-footer-label">
                  Newsletter
                </p>
                <div className="mt-4 space-y-3">
                  <p className="site-footer-copy text-sm leading-6">
                    Join for artisan updates and thoughtful new arrivals.
                  </p>
                  <div className="border-b border-[rgba(244,243,238,0.18)] pb-3 text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(244,243,238,0.56)]">
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
