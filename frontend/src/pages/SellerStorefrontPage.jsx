import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import heroAltImage from '../assets/hero1.png';
import productService from '../services/productService';
import storeService from '../services/storeService';
import { resolveMediaUrl } from '../utils/media';

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
  if (isRenderableImageSrc(store?.banner_url)) {
    return store.banner_url;
  }

  return products.find((product) => isRenderableImageSrc(product?.image))?.image || heroImage;
}

function resolveAvatarImage(store, products) {
  if (isRenderableImageSrc(store?.logo_url)) {
    return store.logo_url;
  }

  return products.find((product) => isRenderableImageSrc(product?.image))?.image || heroAltImage;
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
          ? 'border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] text-white/84'
          : 'border-[rgba(138,129,124,0.18)] bg-[rgba(255,253,249,0.8)] text-[rgba(94,84,78,0.88)]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          light ? 'bg-white/84' : 'bg-[rgba(96,86,80,0.82)]'
        }`}
      />
      Verified
    </span>
  );
}

function ProductRatingSummary({ summary, loading = false }) {
  if (loading) {
    return (
      <p className="mt-2 text-[0.72rem] text-[rgba(112,100,92,0.72)]">
        Loading reviews...
      </p>
    );
  }

  if (!summary || Number(summary.review_count ?? 0) === 0) {
    return (
      <p className="mt-2 text-[0.72rem] text-[rgba(112,100,92,0.72)]">
        New
      </p>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 text-[0.74rem] text-[rgba(88,78,72,0.82)]">
      <span className="font-semibold text-[rgba(28,24,21,0.82)]">
        {formatAverageRating(summary.average_rating)}
      </span>
      <span className="h-1 w-1 rounded-full bg-[rgba(138,129,124,0.5)]" />
      <span>
        {summary.review_count} {summary.review_count === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}

function ProductTile({ product, ratingSummary, ratingsLoading = false }) {
  const imageSrc = isRenderableImageSrc(product?.image) ? product.image : heroImage;

  return (
    <article className="group">
      <Link to={product?.id ? `/products/${product.id}` : '/products'} className="block">
        <div className="overflow-hidden bg-[linear-gradient(160deg,rgba(243,237,231,0.98),rgba(228,219,209,0.9))] shadow-[0_10px_24px_rgba(2,2,2,0.05)]">
          <div className="aspect-[0.92] overflow-hidden bg-[rgba(249,246,242,0.9)]">
            {isRenderableImageSrc(product?.image) ? (
              <img
                src={resolveMediaUrl(imageSrc)}
                alt={product?.name || 'Product'}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : product?.image ? (
              <div className="flex h-full w-full items-center justify-center p-5">
                <p className="max-w-[12rem] text-center text-xs leading-6 text-[rgba(2,2,2,0.52)]">
                  {product.image}
                </p>
              </div>
            ) : (
              <img
                src={resolveMediaUrl(imageSrc)}
                alt={product?.name || 'Product'}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            )}
          </div>
        </div>
      </Link>

      <div className="px-1 pb-1 pt-4">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[rgba(112,100,92,0.82)]">
          {product?.category || 'Collected Piece'}
        </p>
        <Link to={product?.id ? `/products/${product.id}` : '/products'}>
          <h3 className="font-display mt-2 text-[1.7rem] leading-[0.96] text-[var(--color-primary)]">
            {product?.name || 'Untitled piece'}
          </h3>
        </Link>
        <ProductRatingSummary summary={ratingSummary} loading={ratingsLoading} />
        <p className="mt-2 text-[0.92rem] text-[rgba(28,24,21,0.76)]">
          ${formatPrice(product?.price)}
        </p>
      </div>
    </article>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-[rgba(138,129,124,0.14)] pb-6">
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(112,100,92,0.82)]">
        {title}
      </p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function StorefrontFooter() {
  return (
    <footer className="mt-24 bg-[linear-gradient(180deg,#151210,#0d0b0a)] pb-10 pt-16 text-[#f6f1eb]">
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
                Storefronts
              </p>
              <div className="mt-4 grid gap-3">
                <Link to="/products" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Browse Collection</Link>
                <Link to="/login" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Login</Link>
                <Link to="/register" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Become a Seller</Link>
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
          <div className="rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-8 text-sm text-[rgba(2,2,2,0.62)]">
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
          <div className="rounded-[1.5rem] border border-[rgba(138,129,124,0.16)] bg-[rgba(255,253,249,0.72)] p-8">
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
            <div className="rounded-[1.7rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(255,253,249,0.78)] p-8 sm:p-10">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[rgba(112,100,92,0.82)]">
                Storefront
              </p>
              <h1 className="font-display mt-5 text-[3rem] leading-[0.92] text-[var(--color-primary)] sm:text-[4rem]">
                This storefront could not be found.
              </h1>
              <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[rgba(88,78,72,0.86)]">
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
          <div className="relative overflow-hidden rounded-[0.8rem] bg-[#baaa99] shadow-[0_30px_60px_rgba(2,2,2,0.08)]">
            <img
              src={resolveMediaUrl(bannerImage)}
              alt={storeName}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,20,16,0.5)_0%,rgba(27,20,16,0.18)_45%,rgba(27,20,16,0.28)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_72%)]" />
            <div className="relative h-[300px] sm:h-[380px] lg:h-[440px]" />
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-14 max-w-[1200px] px-4 sm:px-6 lg:-mt-16 lg:px-8">
          <div className="rounded-[0.4rem] border border-[rgba(138,129,124,0.12)] bg-[rgba(255,253,249,0.96)] px-5 py-6 shadow-[0_22px_45px_rgba(2,2,2,0.08)] sm:px-7 lg:px-8 lg:py-7">
            <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
              <div className="h-22 w-18 overflow-hidden rounded-[0.15rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(243,238,232,0.9)] sm:h-24 sm:w-20">
                <img
                  src={resolveMediaUrl(avatarImage)}
                  alt={sellerName}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-[2.2rem] leading-[0.95] text-[var(--color-primary)] sm:text-[2.8rem]">
                    {storeName}
                  </h1>
                  {isVerifiedSeller && <VerifiedBadge />}
                </div>
                <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[rgba(112,100,92,0.82)]">
                  {sellerName}
                </p>
                <p className="mt-4 max-w-[42rem] text-sm leading-7 text-[rgba(88,78,72,0.86)] sm:text-[0.96rem]">
                  {storeDescription}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(112,100,92,0.76)]">
                  <span>{store?.store_address}</span>
                  <span>{store?.postal_code}</span>
                  {store?.phone_number ? <span>{store.phone_number}</span> : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-5">
                  {stats.map((item) => (
                    <div key={item.label}>
                      <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-[rgba(138,129,124,0.62)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm text-[rgba(28,24,21,0.86)]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[0.76rem] leading-6 text-[rgba(112,100,92,0.78)]">
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
                  className="rounded-[0.2rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(250,247,243,0.9)] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(112,100,92,0.82)]"
                >
                  Message Seller
                </button>
                <button
                  type="button"
                  className="rounded-[0.2rem] bg-[var(--color-primary)] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white"
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
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(112,100,92,0.82)]">
                  Curated View
                </p>
                <p className="mt-3 text-sm leading-7 text-[rgba(88,78,72,0.78)]">
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
                        ? 'text-[var(--color-primary)]'
                        : 'text-[rgba(112,100,92,0.8)]'
                    }`}
                  >
                    <span>{category === 'all' ? 'All Categories' : category}</span>
                    {category !== 'all' && (
                      <span className="text-[0.7rem] text-[rgba(138,129,124,0.72)]">
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
                        ? 'text-[var(--color-primary)]'
                        : 'text-[rgba(112,100,92,0.8)]'
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
                        ? 'text-[var(--color-primary)]'
                        : 'text-[rgba(112,100,92,0.8)]'
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
                className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[rgba(112,100,92,0.76)]"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="border-b border-[rgba(138,129,124,0.12)] pb-5">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <div className="flex flex-wrap gap-6 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[rgba(138,129,124,0.7)]">
                    <span className="text-[var(--color-primary)]">Products ({productCount})</span>
                    <span>About the Atelier</span>
                    <span>Contact</span>
                  </div>
                  <h2 className="font-display mt-4 text-[2.4rem] leading-[0.98] text-[var(--color-primary)]">
                    Collected Works
                  </h2>
                  <p className="mt-3 max-w-[38rem] text-sm leading-7 text-[rgba(88,78,72,0.82)]">
                    {supportingLine}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[rgba(138,129,124,0.68)]">
                    Showing
                  </p>
                  <p className="mt-2 text-sm text-[rgba(28,24,21,0.78)]">
                    {productCount} of {totalProductCount} pieces
                  </p>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mt-10 rounded-[0.5rem] border border-[rgba(138,129,124,0.14)] bg-[rgba(255,253,249,0.62)] px-6 py-10">
                <p className="font-display text-[2rem] leading-none text-[var(--color-primary)]">
                  Nothing matches the current view.
                </p>
                <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[rgba(88,78,72,0.82)]">
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
