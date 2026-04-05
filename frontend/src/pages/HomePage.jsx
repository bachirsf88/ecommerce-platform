import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import { resolveEntityImageUrl } from '../utils/media';
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
  imageClassName = '',
  overlayClassName = '',
}) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-[1.45rem] border border-[rgba(138,129,124,0.16)] ${className}`}
    >
      <img
        src={heroImage}
        alt={title}
        className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
      />
      <div className={`absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,2,0.08),rgba(2,2,2,0.62))] ${overlayClassName}`} />
      <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/72">
          {subtitle}
        </p>
        <h3 className="font-display mt-2 text-4xl leading-none">
          {title}
        </h3>
        {description && (
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/74">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}

function ArrivalItem({ product }) {
  const imageSrc = resolveEntityImageUrl(product?.image_url, product?.image);

  return (
    <Link to={product?.id ? `/products/${product.id}` : '/products'} className="group">
      <div className="overflow-hidden rounded-[1.1rem] bg-[linear-gradient(160deg,rgba(239,231,223,0.95),rgba(226,216,207,0.9))]">
        <div className="flex aspect-[0.9] items-center justify-center p-4">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product?.name || 'Product'}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              src={heroImage}
              alt={product?.name || 'Product'}
              className="h-full w-full object-cover object-center"
            />
          )}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          {product?.category || 'Artisan'}
        </p>
        <h3 className="font-display text-2xl leading-none text-[var(--color-primary)]">
          {product?.name || 'Unnamed product'}
        </h3>
        <p className="text-sm text-[rgba(2,2,2,0.66)]">
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
          <div className="relative overflow-hidden rounded-[1.9rem] bg-[#d9cfc4]">
            <img
              src={heroImage}
              alt="Artisan marketplace hero"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,19,17,0.54)_0%,rgba(22,19,17,0.14)_42%,rgba(22,19,17,0.06)_100%)]" />
            <div className="relative z-10 min-h-[460px] px-7 py-8 sm:px-10 sm:py-10 lg:min-h-[560px] lg:px-14 lg:py-14">
              <div className="flex h-full max-w-[320px] flex-col justify-end sm:max-w-[400px]">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/76">
                  Curated Marketplace
                </p>
                <h1 className="font-display mt-4 text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
                  The Art of the Handmade
                </h1>
                <p className="mt-4 text-sm leading-7 text-white/76 sm:text-base">
                  Discover artisan products from women-led home businesses through a calm, editorial shopping experience.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/products" className="btn-base border border-white bg-white text-[var(--color-primary)]">
                    Explore Products
                  </Link>
                  <Link
                    to={sellerCtaLink}
                    className="btn-base border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.08)] text-white backdrop-blur-sm"
                  >
                    {sellerCtaLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="mb-6">
            <p className="text-xs font-medium text-[rgba(138,129,124,0.82)]">Featured Collections</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.45fr_0.82fr]">
            <div className="grid gap-4">
              <MediaTile
                title={categories[0]?.name || 'Collection'}
                subtitle={categories[0]?.subtitle || 'Featured Collection'}
                description={categories[0]?.description}
                imageClassName="object-[center_35%]"
                className="min-h-[280px]"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <MediaTile
                  title={categories[1]?.name || 'Collection'}
                  subtitle={categories[1]?.subtitle || 'Featured'}
                  imageClassName="object-[center_70%]"
                  className="min-h-[220px]"
                />
                <MediaTile
                  title={categories[2]?.name || 'Collection'}
                  subtitle={categories[2]?.subtitle || 'Featured'}
                  imageClassName="object-[center_55%]"
                  className="min-h-[220px]"
                />
              </div>
            </div>

            <MediaTile
              title={categories[3]?.name || 'Collection'}
              subtitle={categories[3]?.subtitle || 'Featured'}
              description={categories[3]?.description}
              imageClassName="object-[center_55%]"
              className="min-h-[520px]"
            />
          </div>
        </section>

        <section className="pt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.9)]">
                Latest Products
              </p>
              <h2 className="font-display mt-3 text-4xl leading-none text-[var(--color-primary)] sm:text-5xl">
                New Arrivals
              </h2>
            </div>
            <Link to="/products" className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
              Shop All Products
            </Link>
          </div>

          {loading && (
            <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">
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
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.9)]">
                Editorial Selection
              </p>
              <h2 className="font-display mt-5 text-5xl leading-[0.92] text-[var(--color-primary)] sm:text-6xl">
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
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-[rgba(224,175,160,0.3)]">
                      <img
                        src={heroImage}
                        alt={product?.name || 'Product'}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">
                        {product?.name || `Curated item ${index + 1}`}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                        ${product?.price ?? 'N/A'} · {product?.category || 'Artisan'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[1.9rem] bg-[#e4dbd1] shadow-[0_18px_40px_rgba(2,2,2,0.08)]">
                <img
                  src={heroImage}
                  alt="Editorial artisan composition"
                  className="h-[420px] w-full object-cover object-center sm:h-[520px]"
                />
              </div>

              <div className="absolute bottom-6 left-6 w-[180px] rounded-[1.2rem] bg-white p-4 shadow-[0_18px_36px_rgba(2,2,2,0.1)] sm:bottom-8 sm:left-8">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                  Curated Note
                </p>
                <p className="mt-3 text-sm leading-6 text-[rgba(2,2,2,0.7)]">
                  Thoughtful presentation helps handmade work feel elevated without losing usability.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[rgba(188,184,177,0.9)]">
              Join the Journal
            </p>
            <h2 className="font-display mt-4 text-4xl leading-none text-[var(--color-primary)] sm:text-5xl">
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
              <button type="submit" className="btn-base btn-primary sm:px-6">
                Join
              </button>
            </form>
          </div>
        </section>
      </div>

      <footer className="mt-20 bg-[var(--color-primary)] pb-8 pt-14 text-[#f6f1eb]">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="font-display text-4xl leading-none text-white sm:text-5xl">
                GradShop
              </p>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[rgba(255,250,247,0.72)]">
                A refined artisan marketplace for women-led home businesses, thoughtful product discovery, and handmade pieces presented with warmth and restraint.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[rgba(255,250,247,0.46)]">
                  Navigate
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Home</Link>
                  <Link to="/products" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Products</Link>
                  <Link to={sellerCtaLink} className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">
                    {sellerCtaLabel}
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[rgba(255,250,247,0.46)]">
                  Account
                </p>
                <div className="mt-4 grid gap-3">
                  {!isAuthenticated && <Link to="/login" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Login</Link>}
                  {!isAuthenticated && <Link to="/register" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Register</Link>}
                  {canAccessBuyerFeatures(user) && <Link to="/favorites" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Favorites</Link>}
                  {canAccessBuyerFeatures(user) && <Link to="/orders" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">My Orders</Link>}
                  {user?.role === 'seller' && <Link to="/seller/products" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Seller Space</Link>}
                  {user?.role === 'admin' && <Link to="/admin" className="text-sm text-[rgba(255,250,247,0.78)] hover:text-white">Admin Area</Link>}
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
