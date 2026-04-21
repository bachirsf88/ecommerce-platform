import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import heroAltImage from '../assets/hero1.png';
import productService from '../services/productService';
import storeService from '../services/storeService';
import { resolveEntityImageUrl, resolveMediaUrl } from '../utils/media';

const isRenderableImageSrc = (value) =>
  typeof value === 'string' && /^(https?:\/\/|data:|\/)/i.test(value.trim());

const priceRanges = [
  { id: 'all', label: 'All Prices', min: null, max: null },
  { id: 'under-50', label: 'Under $50', min: null, max: 50 },
  { id: '50-150', label: '$50 - $150', min: 50, max: 150 },
  { id: '150-300', label: '$150 - $300', min: 150, max: 300 },
  { id: '300-plus', label: '$300+', min: 300, max: null },
];

const getProductRatingKey = (productId) => String(productId ?? '');

function formatPrice(value) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return 'N/A';
  }

  return numericValue.toFixed(2);
}

function resolveFallbackLocation(store) {
  const address = store?.store_address?.trim();
  const postalCode = store?.postal_code?.trim();

  if (address && postalCode) {
    return `${address} · ${postalCode}`;
  }

  return address || postalCode || 'Artisan Studio';
}

function resolveBannerImage(store, products) {
  if (isRenderableImageSrc(store?.banner_image_url)) {
    return store.banner_image_url;
  }

  if (isRenderableImageSrc(store?.banner_url)) {
    return store.banner_url;
  }

  return (
    products.find((product) => isRenderableImageSrc(product?.image_url || product?.image))?.image_url ||
    products.find((product) => isRenderableImageSrc(product?.image_url || product?.image))?.image ||
    heroImage
  );
}

function resolveAvatarImage(store, products) {
  if (isRenderableImageSrc(store?.logo_image_url)) {
    return store.logo_image_url;
  }

  if (isRenderableImageSrc(store?.logo_url)) {
    return store.logo_url;
  }

  return (
    products.find((product) => isRenderableImageSrc(product?.image_url || product?.image))?.image_url ||
    products.find((product) => isRenderableImageSrc(product?.image_url || product?.image))?.image ||
    heroAltImage
  );
}

function formatAverageRating(value) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue.toFixed(1);
}

function VerifiedBadge({ light = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] ${
        light
          ? 'border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.12)] text-white/84'
          : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] text-[var(--color-primary)]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          light ? 'bg-white/84' : 'bg-[var(--color-primary)]'
        }`}
      />
      Verified
    </span>
  );
}

function ProductRatingSummary({ summary, loading = false }) {
  if (loading) {
    return (
      <p className="mt-2 text-[0.72rem] text-[var(--color-text-faint)]">
        Loading reviews...
      </p>
    );
  }

  if (!summary || Number(summary.review_count ?? 0) === 0) {
    return (
      <p className="mt-2 text-[0.72rem] text-[var(--color-text-faint)]">
        New
      </p>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 text-[0.74rem] text-[var(--color-text-soft)]">
      <span className="font-semibold text-[var(--color-text)]">
        {formatAverageRating(summary.average_rating)}
      </span>
      <span className="h-1 w-1 rounded-full bg-[var(--color-border-strong)]" />
      <span>
        {summary.review_count} {summary.review_count === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}

function ProductTile({ product, ratingSummary, ratingsLoading = false }) {
  const imageSrc = resolveEntityImageUrl(product?.image_url, product?.image) || heroImage;

  return (
    <article className="group">
      <Link to={product?.id ? `/products/${product.id}` : '/products'} className="block">
        <div className="overflow-hidden bg-[linear-gradient(160deg,rgba(244,243,238,0.96),rgba(188,184,177,0.34))] shadow-[0_10px_24px_rgba(138,129,124,0.12)]">
          <div className="aspect-[0.92] overflow-hidden bg-[rgba(255,255,255,0.88)]">
            {imageSrc !== heroImage ? (
              <img
                src={imageSrc}
                alt={product?.name || 'Product'}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <img
                src={imageSrc}
                alt={product?.name || 'Product'}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            )}
          </div>
        </div>
      </Link>

      <div className="px-1 pb-1 pt-4">
        <p className="page-kicker text-[0.58rem]">
          {product?.category || 'Collected Piece'}
        </p>
        <Link to={product?.id ? `/products/${product.id}` : '/products'}>
          <h3 className="font-display mt-2 text-[1.7rem] leading-[0.96] text-[var(--color-primary)]">
            {product?.name || 'Untitled piece'}
          </h3>
        </Link>
        <ProductRatingSummary summary={ratingSummary} loading={ratingsLoading} />
        <p className="mt-2 text-[0.92rem] text-[var(--color-text-soft)]">
          ${formatPrice(product?.price)}
        </p>
      </div>
    </article>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-[var(--color-border-soft)] pb-6">
      <p className="page-kicker text-[0.58rem]">
        {title}
      </p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function StorefrontFooter() {
  return (
    <footer className="site-footer mt-24 pb-10 pt-16">
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
                Storefronts
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/products" className="site-footer-link text-sm">Browse Collection</Link>
                <Link to="/login" className="site-footer-link text-sm">Login</Link>
                <Link to="/register" className="site-footer-link text-sm">Become a Seller</Link>
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
  );
}

function SellerStorefrontPage() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [productRatings, setProductRatings] = useState({});
  const [ratingsLoading, setRatingsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStorefront = async () => {
      let storeData = null;

      setLoading(true);
      setError('');
      setNotFound(false);

      try {
        storeData = await storeService.getStoreById(id);

        if (!isMounted) {
          return;
        }

        setStore(storeData);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (err.response?.status === 404) {
          setNotFound(true);
          setStore(null);
          setProducts([]);
        } else {
          setError(err.response?.data?.message || 'Failed to load storefront.');
        }

        setLoading(false);
        return;
      }

      try {
        const sellerId = storeData?.seller?.id ?? null;
        const sellerProducts = sellerId
          ? await productService.getSellerProducts(sellerId)
          : [];

        if (isMounted) {
          setProducts(sellerProducts);
        }
      } catch (err) {
        if (isMounted) {
          setProducts([]);
          setError(err.response?.data?.message || 'Failed to load store products.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStorefront();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadProductRatings = async () => {
      if (products.length === 0) {
        setProductRatings({});
        setRatingsLoading(false);
        return;
      }

      setRatingsLoading(true);

      try {
        const entries = await Promise.all(
          products.map(async (product) => {
            const productId = getProductRatingKey(product?.id);

            if (!productId) {
              return [productId, null];
            }

            try {
              const reviewData = await productService.getProductReviews(productId);

              return [
                productId,
                {
                  average_rating: Number(reviewData?.average_rating ?? 0),
                  review_count: Number(reviewData?.review_count ?? 0),
                },
              ];
            } catch {
              return [productId, null];
            }
          })
        );

        if (isMounted) {
          setProductRatings(Object.fromEntries(entries.filter(([key]) => key)));
        }
      } finally {
        if (isMounted) {
          setRatingsLoading(false);
        }
      }
    };

    loadProductRatings();

    return () => {
      isMounted = false;
    };
  }, [products]);

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product?.category).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatches =
        selectedCategory === 'all' || product?.category === selectedCategory;

      const numericPrice = Number(product?.price ?? 0);
      const activePriceRange = priceRanges.find((range) => range.id === selectedPriceRange);
      const minMatches = activePriceRange?.min === null || numericPrice >= activePriceRange.min;
      const maxMatches = activePriceRange?.max === null || numericPrice <= activePriceRange.max;

      const stockCount = Number(product?.stock ?? 0);
      const availabilityMatches =
        selectedAvailability === 'all'
          ? true
          : selectedAvailability === 'in-stock'
            ? stockCount > 0
            : stockCount <= 0;

      return categoryMatches && minMatches && maxMatches && availabilityMatches;
    });
  }, [products, selectedAvailability, selectedCategory, selectedPriceRange]);

  const bannerImage = useMemo(() => resolveBannerImage(store, products), [products, store]);
  const avatarImage = useMemo(() => resolveAvatarImage(store, products), [products, store]);
  const productCount = filteredProducts.length;
  const totalProductCount = products.length;
  const sellerName = store?.seller?.name || 'Marketplace Seller';
  const storeName = store?.store_name || 'Seller Store';
  const sellerStatus = store?.seller?.status;
  const isVerifiedSeller = sellerStatus === 'approved';
  const storeDescription =
    store?.description?.trim() ||
    'A quiet collection of handmade pieces, gathered into a storefront shaped for slower and more thoughtful discovery.';
  const supportingLine =
    totalProductCount > 0
      ? `${totalProductCount} collected ${totalProductCount === 1 ? 'piece' : 'pieces'} presented through a calm atelier storefront.`
      : 'An artisan storefront prepared for thoughtful discovery as the collection begins to take shape.';
  const locationLabel = resolveFallbackLocation(store);
  const storefrontRatingSummary = useMemo(() => {
    const summaries = Object.values(productRatings).filter(
      (summary) => summary && Number(summary.review_count ?? 0) > 0
    );

    if (summaries.length === 0) {
      return {
        average_rating: null,
        review_count: 0,
        rated_products: 0,
      };
    }

    const totalReviewCount = summaries.reduce(
      (sum, summary) => sum + Number(summary.review_count ?? 0),
      0
    );
    const weightedRatingTotal = summaries.reduce(
      (sum, summary) =>
        sum + Number(summary.average_rating ?? 0) * Number(summary.review_count ?? 0),
      0
    );

    return {
      average_rating: totalReviewCount > 0 ? weightedRatingTotal / totalReviewCount : null,
      review_count: totalReviewCount,
      rated_products: summaries.length,
    };
  }, [productRatings]);
  const stats = [
    {
      label: 'Rating',
      value: storefrontRatingSummary.review_count > 0
        ? `${formatAverageRating(storefrontRatingSummary.average_rating)} · ${storefrontRatingSummary.review_count} ${storefrontRatingSummary.review_count === 1 ? 'review' : 'reviews'}`
        : ratingsLoading
          ? 'Loading reviews...'
          : 'No reviews yet',
    },
    { label: 'Contact', value: store?.contact_email || store?.phone_number || 'Available on request' },
    { label: 'Location', value: locationLabel },
  ];

  if (loading) {
    return (
      <div className="page-shell pb-0">
        <div className="page-container max-w-[1180px]">
          <div className="surface-card p-8 text-sm text-[var(--color-text-soft)]">
            Loading storefront...
          </div>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell pb-0">
        <div className="page-container max-w-[1180px]">
          <div className="surface-card p-8">
            <p className="status-message status-error mb-4">{error}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-base btn-outline">
                Browse Products
              </Link>
              <Link to="/" className="btn-base btn-secondary">
                Return Home
              </Link>
            </div>
          </div>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="page-shell pb-0">
        <div className="page-container max-w-[1180px]">
          <section className="pt-6">
            <div className="surface-card-strong p-8 sm:p-10">
              <p className="page-kicker text-[0.62rem]">
                Storefront
              </p>
              <h1 className="font-display mt-5 text-[3rem] leading-[0.92] text-[var(--color-text)] sm:text-[4rem]">
                This storefront could not be found.
              </h1>
              <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[var(--color-text-soft)]">
                The store may not exist yet, or the public link may no longer be available.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/products" className="btn-base btn-primary">
                  Browse Products
                </Link>
                <Link to="/" className="btn-base btn-outline">
                  Return Home
                </Link>
              </div>
            </div>
          </section>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="page-shell px-0 pb-0 pt-0">
      <section className="relative">
        <div className="mx-auto max-w-[1320px] px-4 pt-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[0.8rem] bg-[var(--color-border-base)] shadow-[0_30px_60px_rgba(138,129,124,0.16)]">
            <img
              src={resolveMediaUrl(bannerImage)}
              alt={storeName}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,2,2,0.5)_0%,rgba(2,2,2,0.18)_45%,rgba(2,2,2,0.28)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_72%)]" />
            <div className="relative h-[300px] sm:h-[380px] lg:h-[440px]" />
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-14 max-w-[1200px] px-4 sm:px-6 lg:-mt-16 lg:px-8">
          <div className="rounded-[0.4rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.96)] px-5 py-6 shadow-[0_22px_45px_rgba(138,129,124,0.16)] sm:px-7 lg:px-8 lg:py-7">
            <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
              <div className="h-22 w-18 overflow-hidden rounded-[0.15rem] border border-[var(--color-border)] bg-[rgba(244,243,238,0.92)] sm:h-24 sm:w-20">
                <img
                  src={resolveMediaUrl(avatarImage)}
                  alt={sellerName}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-[2.2rem] leading-[0.95] text-[var(--color-text)] sm:text-[2.8rem]">
                    {storeName}
                  </h1>
                  {isVerifiedSeller && <VerifiedBadge />}
                </div>
                <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
                  {sellerName}
                </p>
                <p className="mt-4 max-w-[42rem] text-sm leading-7 text-[var(--color-text-faint)] sm:text-[0.96rem]">
                  {storeDescription}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                  <span>{store?.store_address}</span>
                  <span>{store?.postal_code}</span>
                  {store?.phone_number ? <span>{store.phone_number}</span> : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-5">
                  {stats.map((item) => (
                    <div key={item.label}>
                      <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[0.76rem] leading-6 text-[var(--color-text-faint)]">
                  {storefrontRatingSummary.review_count > 0
                    ? `${storefrontRatingSummary.rated_products} ${storefrontRatingSummary.rated_products === 1 ? 'piece has' : 'pieces have'} received feedback so far.`
                    : ratingsLoading
                      ? 'Review summaries are loading across the collection.'
                      : 'Newly listed store with feedback still to come.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <button
                  type="button"
                  className="rounded-[0.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.9)] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]"
                >
                  Message Seller
                </button>
                <button
                  type="button"
                  className="rounded-[0.2rem] bg-[var(--color-brand)] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)]"
                >
                  Follow Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container max-w-[1200px] px-4 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-6">
              <div className="pb-2">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                  Curated View
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-faint)]">
                  Refine the collection by category, price, and current availability.
                </p>
              </div>

              <FilterSection title="Categories">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`flex w-full items-center justify-between text-left text-sm ${
                      selectedCategory === category
                        ? 'text-[var(--color-text)]'
                        : 'text-[var(--color-text-faint)]'
                    }`}
                  >
                    <span>{category === 'all' ? 'All Categories' : category}</span>
                    {category !== 'all' && (
                      <span className="text-[0.7rem] text-[var(--color-text-faint)]">
                        {products.filter((product) => product?.category === category).length}
                      </span>
                    )}
                  </button>
                ))}
              </FilterSection>

              <FilterSection title="Price Range">
                {priceRanges.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setSelectedPriceRange(range.id)}
                    className={`block w-full text-left text-sm ${
                      selectedPriceRange === range.id
                        ? 'text-[var(--color-text)]'
                        : 'text-[var(--color-text-faint)]'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </FilterSection>

              <FilterSection title="Availability">
                {[
                  { id: 'all', label: 'All Pieces' },
                  { id: 'in-stock', label: 'In Stock' },
                  { id: 'out-of-stock', label: 'Sold Out' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAvailability(item.id)}
                    className={`block w-full text-left text-sm ${
                      selectedAvailability === item.id
                        ? 'text-[var(--color-text)]'
                        : 'text-[var(--color-text-faint)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </FilterSection>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriceRange('all');
                  setSelectedAvailability('all');
                }}
                className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="border-b border-[var(--color-border-soft)] pb-5">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <div className="flex flex-wrap gap-6 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                    <span className="text-[var(--color-text)]">Products ({productCount})</span>
                    <span>About the Atelier</span>
                    <span>Contact</span>
                  </div>
                  <h2 className="font-display mt-4 text-[2.4rem] leading-[0.98] text-[var(--color-text)]">
                    Collected Works
                  </h2>
                  <p className="mt-3 max-w-[38rem] text-sm leading-7 text-[var(--color-text-faint)]">
                    {supportingLine}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
                    Showing
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                    {productCount} of {totalProductCount} pieces
                  </p>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="soft-panel mt-10 px-6 py-10">
                <p className="font-display text-[2rem] leading-none text-[var(--color-text)]">
                  Nothing matches the current view.
                </p>
                <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[var(--color-text-faint)]">
                  Try widening the filters, or return to the full collection to explore everything this store has published so far.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedPriceRange('all');
                    setSelectedAvailability('all');
                  }}
                  className="btn-base btn-outline mt-6"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    ratingSummary={productRatings[getProductRatingKey(product.id)]}
                    ratingsLoading={ratingsLoading && !productRatings[getProductRatingKey(product.id)]}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}

export default SellerStorefrontPage;
