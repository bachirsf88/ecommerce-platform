import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import fashionProductFallback from '../assets/fashion-product-fallback.jpg';
import marketplaceHero from '../assets/marketplace-hero.png';
import productGalleryFallback from '../assets/product-gallery-fallback.jpg';
import sellerWorkspaceCover from '../assets/seller-workspace-cover.jpg';
import storefrontBannerFallback from '../assets/storefront-banner-fallback.jpg';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import { resolveProductPrimaryImage } from '../utils/media';
import { canAccessBuyerFeatures } from '../utils/roles';

const fallbackCategories = [
  {
    name: 'Ceramics',
    subtitle: 'Featured Collection',
    description: 'Soft forms and calm decorative pieces for thoughtful interiors.',
    position: 'left top',
  },
  {
    name: 'Jewelry',
    subtitle: 'Small Details',
    description: 'Refined handmade accents with a personal, expressive character.',
    position: 'center',
  },
  {
    name: 'Woodwork',
    subtitle: 'Crafted Utility',
    description: 'Warm artisan workmanship shaped into elegant everyday objects.',
    position: 'right center',
  },
  {
    name: 'Textiles',
    subtitle: 'Layered Texture',
    description: 'Textural pieces that bring warmth, softness, and comfort to daily life.',
    position: 'left center',
  },
];

function MediaTile({
  title,
  subtitle,
  description,
  to = '/products',
  className = '',
  imageSrc = marketplaceHero,
  imageClassName = '',
  overlayClassName = '',
}) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-[1.45rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.84)] shadow-[var(--shadow-card)] ${className}`}
    >
      <img
        src={imageSrc}
        alt={title}
        className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
      />
      <div className={`absolute inset-0 bg-[linear-gradient(180deg,rgba(244,243,238,0.08),rgba(244,243,238,0.9))] ${overlayClassName}`} />
      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <div className="max-w-[17rem] rounded-[1.1rem] border border-[rgba(188,184,177,0.74)] bg-[rgba(255,255,255,0.7)] p-4 backdrop-blur-sm">
          <p className="page-kicker text-[0.62rem]">
            {subtitle}
          </p>
          <h3 className="font-display mt-2 text-4xl leading-none text-[var(--color-text)]">
            {title}
          </h3>
          {description && (
            <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-text-soft)]">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function ArrivalItem({ product }) {
  const imageSrc = resolveProductPrimaryImage(product, fashionProductFallback);

  return (
    <Link to={product?.id ? `/products/${product.id}` : '/products'} className="group">
      <div className="image-shell rounded-[1.1rem]">
        <div className="flex aspect-[0.9] items-center justify-center p-4">
          <img
            src={imageSrc}
            alt={product?.name || 'Product'}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          {product?.category || 'Artisan'}
        </p>
        <h3 className="font-display text-2xl leading-none text-[var(--color-primary)]">
          {product?.name || 'Unnamed product'}
        </h3>
        <p className="text-sm text-[var(--color-text-soft)]">
          ${product?.price ?? 'N/A'}
        </p>
      </div>
    </Link>
  );
}

function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load home page products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const dynamic = [...new Set(products.map((product) => product?.category).filter(Boolean))]
      .slice(0, 4)
      .map((category, index) => ({
        ...fallbackCategories[index],
        name: category,
      }));

    return dynamic.length > 0 ? dynamic : fallbackCategories;
  }, [products]);

  const latestProducts = [...products].reverse().slice(0, 4);
  const editorialProducts = products.slice(0, 3);
  const sellerCtaLink = !isAuthenticated
    ? '/register'
    : user?.role === 'seller'
      ? '/seller/products'
      : user?.role === 'admin'
        ? '/admin'
        : '/register';

  const sellerCtaLabel = !isAuthenticated
    ? 'Become a Seller'
    : user?.role === 'seller'
      ? 'Open Seller Space'
      : user?.role === 'admin'
        ? 'Open Admin Area'
        : 'Become a Seller';

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-2">
          <div className="relative overflow-hidden rounded-[1.9rem] border border-[var(--color-border-strong)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(244,243,238,0.98),rgba(122,75,46,0.18))] shadow-[var(--shadow-lifted)]">
            <img
              src={marketplaceHero}
              alt="Artisan marketplace hero"
              className="absolute inset-y-0 right-0 h-full w-full object-cover object-center opacity-65 lg:w-[56%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,243,238,0.96)_0%,rgba(244,243,238,0.88)_44%,rgba(244,243,238,0.2)_100%)]" />
            <div className="absolute inset-y-0 right-0 w-full bg-[radial-gradient(circle_at_right,rgba(122,75,46,0.18),transparent_34%)] lg:w-[55%]" />
            <div className="relative z-10 min-h-[460px] px-7 py-8 sm:px-10 sm:py-10 lg:min-h-[560px] lg:px-14 lg:py-14">
              <div className="flex h-full max-w-[34rem] flex-col justify-end">
                <p className="page-kicker text-[0.62rem]">
                  Curated Marketplace
                </p>
                <h1 className="font-display mt-4 text-5xl leading-[0.9] text-[var(--color-text)] sm:text-6xl lg:text-7xl">
                  The Art of the Handmade
                </h1>
                <p className="mt-4 max-w-[30rem] text-sm leading-7 text-[var(--color-text-soft)] sm:text-base">
                  Discover artisan products from women-led home businesses through a calm, editorial shopping experience.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/products" className="btn-base btn-primary border-[var(--color-brand)] bg-[var(--color-brand)] px-7 shadow-[0_14px_30px_rgba(122,75,46,0.24)]">
                    Explore Products
                  </Link>
                  <Link
                    to={sellerCtaLink}
                    className="btn-base border border-[var(--color-brand)] bg-[rgba(122,75,46,0.08)] px-7 text-[var(--color-brand)] hover:bg-[rgba(122,75,46,0.14)]"
                  >
                    {sellerCtaLabel}
                  </Link>
                </div>

                {/* <div className="mt-8 grid max-w-[28rem] gap-3 sm:grid-cols-3">
                  {[
                    ['Palette', '#F4F3EE'],
                    ['Borders', '#BCB8B1'],
                    ['Actions', '#7A4B2E'],
                  ].map(([label, value]) => (
                    <div key={label} className={`rounded-[1.15rem] border px-4 py-4 backdrop-blur-sm ${label === 'Actions' ? 'border-[var(--color-brand)] bg-[rgba(122,75,46,0.12)] shadow-[0_12px_26px_rgba(122,75,46,0.14)]' : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.74)]'}`}>
                      <p className="page-kicker text-[0.56rem]">{label}</p>
                      <p className={`mt-2 text-sm font-semibold ${label === 'Actions' ? 'text-[var(--color-brand)]' : 'text-[var(--color-text)]'}`}>{value}</p>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="mb-6">
            <p className="page-kicker">Featured Collections</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.45fr_0.82fr]">
            <div className="grid gap-4">
              <MediaTile
                title={categories[0]?.name || 'Collection'}
                subtitle={categories[0]?.subtitle || 'Featured Collection'}
                description={categories[0]?.description}
                imageSrc={marketplaceHero}
                imageClassName="object-[center_35%]"
                className="min-h-[280px]"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <MediaTile
                  title={categories[1]?.name || 'Collection'}
                  subtitle={categories[1]?.subtitle || 'Featured'}
                  imageSrc={fashionProductFallback}
                  imageClassName="object-[center_70%]"
                  className="min-h-[220px]"
                />
                <MediaTile
                  title={categories[2]?.name || 'Collection'}
                  subtitle={categories[2]?.subtitle || 'Featured'}
                  imageSrc={productGalleryFallback}
                  imageClassName="object-[center_55%]"
                  className="min-h-[220px]"
                />
              </div>
            </div>

            <MediaTile
              title={categories[3]?.name || 'Collection'}
              subtitle={categories[3]?.subtitle || 'Featured'}
              description={categories[3]?.description}
              imageSrc={storefrontBannerFallback}
              imageClassName="object-[center_55%]"
              className="min-h-[520px]"
            />
          </div>
        </section>

        <section className="pt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="page-kicker">
                Latest Products
              </p>
              <h2 className="font-display mt-3 text-4xl leading-none text-[var(--color-text)] sm:text-5xl">
                New Arrivals
              </h2>
            </div>
            <Link to="/products" className="line-link rounded-full border border-[var(--color-brand)] bg-[rgba(122,75,46,0.08)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] hover:bg-[rgba(122,75,46,0.14)]">
              Shop All Products
            </Link>
          </div>

          {loading && (
            <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">
              Loading new arrivals...
            </div>
          )}

          {error && (
            <div className="status-message status-error">
              {error}
            </div>
          )}

          {!loading && !error && latestProducts.length === 0 && (
            <div className="empty-state">
              New arrivals will appear here once products are available.
            </div>
          )}

          {!loading && !error && latestProducts.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {latestProducts.map((product) => (
                <ArrivalItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section className="pt-24">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="px-2 sm:px-4">
              <p className="page-kicker">
                Editorial Selection
              </p>
              <h2 className="font-display mt-5 text-5xl leading-[0.92] text-[var(--color-text)] sm:text-6xl">
                The Curated Workspace
              </h2>
              <p className="subtle-copy mt-5 max-w-md text-base">
                A calmer way to browse handmade products with texture, balance, and warmth at the center of the experience.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {editorialProducts.slice(0, 2).map((product, index) => (
                  <Link
                    key={product?.id || `editorial-link-${index}`}
                    to={product?.id ? `/products/${product.id}` : '/products'}
                    className="flex items-center gap-4"
                  >
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
                      <img
                        src={resolveProductPrimaryImage(product, fashionProductFallback)}
                        alt={product?.name || 'Product'}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {product?.name || `Curated item ${index + 1}`}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-brand)]">
                        ${product?.price ?? 'N/A'} · {product?.category || 'Artisan'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="image-shell rounded-[1.9rem]">
                <img
                  src={sellerWorkspaceCover}
                  alt="Editorial artisan composition"
                  className="h-[420px] w-full object-cover object-center sm:h-[520px]"
                />
              </div>

              <div className="absolute bottom-6 left-6 w-[190px] rounded-[1.2rem] border border-[var(--color-brand)] bg-[rgba(255,255,255,0.94)] p-4 shadow-[0_20px_40px_rgba(122,75,46,0.16)] sm:bottom-8 sm:left-8">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
                  Curated Note
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-soft)]">
                  Thoughtful presentation helps handmade work feel elevated without losing usability.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="page-kicker">
              Join the Journal
            </p>
            <h2 className="font-display mt-4 text-4xl leading-none text-[var(--color-text)] sm:text-5xl">
              Stay close to new artisan arrivals.
            </h2>
            <p className="subtle-copy mt-4 text-sm">
              A quiet invitation to keep exploring the marketplace and discover newly added handmade pieces.
            </p>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="text-input min-w-0 flex-1"
              />
              <button type="submit" className="btn-base btn-primary border-[var(--color-brand)] bg-[var(--color-brand)] px-7 sm:px-6">
                Join
              </button>
            </form>
          </div>
        </section>
      </div>

      <footer className="site-footer mt-20 pb-8 pt-14">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="font-display text-4xl leading-none text-[var(--color-background)] sm:text-5xl">
                GradShop
              </p>
              <p className="site-footer-copy mt-5 max-w-xl text-sm leading-7">
                A refined artisan marketplace for women-led home businesses, thoughtful product discovery, and handmade pieces presented with warmth and restraint.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="site-footer-label">
                  Navigate
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/" className="site-footer-link text-sm">Home</Link>
                  <Link to="/products" className="site-footer-link text-sm">Products</Link>
                  <Link to={sellerCtaLink} className="site-footer-link text-sm">
                    {sellerCtaLabel}
                  </Link>
                </div>
              </div>

              <div>
                <p className="site-footer-label">
                  Account
                </p>
                <div className="mt-4 grid gap-3">
                  {!isAuthenticated && <Link to="/login" className="site-footer-link text-sm">Login</Link>}
                  {!isAuthenticated && <Link to="/register" className="site-footer-link text-sm">Register</Link>}
                  {canAccessBuyerFeatures(user) && <Link to="/favorites" className="site-footer-link text-sm">Favorites</Link>}
                  {canAccessBuyerFeatures(user) && <Link to="/orders" className="site-footer-link text-sm">My Orders</Link>}
                  {user?.role === 'seller' && <Link to="/seller/products" className="site-footer-link text-sm">Seller Space</Link>}
                  {user?.role === 'admin' && <Link to="/admin" className="site-footer-link text-sm">Admin Area</Link>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
