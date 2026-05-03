import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import fashionProductFallback from '../assets/fashion-product-fallback.jpg';
import storefrontBannerFallback from '../assets/storefront-banner-fallback.jpg';
import FallbackImage from '../components/common/FallbackImage';
import categoryService from '../services/categoryService';
import { formatCurrency } from '../utils/formatters';
import { resolveProductPrimaryImage } from '../utils/media';

function CategoryDetailsPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategoryPage = async () => {
      setLoading(true);
      setError('');

      try {
        const [categoryData, productData] = await Promise.all([
          categoryService.getCategoryBySlug(slug),
          categoryService.getCategoryProducts(slug),
        ]);

        setCategory(categoryData);
        setProducts(productData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load this category.');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryPage();
  }, [slug]);

  if (loading) {
    return <div className="page-shell"><div className="page-container"><div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading category...</div></div></div>;
  }

  if (error) {
    return <div className="page-shell"><div className="page-container"><div className="status-message status-error">{error}</div></div></div>;
  }

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-4">
          <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <span className="text-[var(--color-brand)]">{category?.name || 'Category'}</span>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="page-kicker">
                {category?.parent?.name ? `${category.parent.name} Collection` : 'Category Collection'}
              </p>
              <h1 className="font-display mt-4 text-[3rem] leading-[0.92] text-[var(--color-text)] sm:text-6xl">
                {category?.name || 'Collection'}
              </h1>
              <p className="mt-5 max-w-[36rem] text-sm leading-8 text-[var(--color-text-soft)]">
                {category?.description || 'Browse approved products curated inside this category.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                  {products.length} approved products
                </span>
                <span className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                  {category?.children?.length || 0} child categories
                </span>
              </div>
              {category?.children?.length ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/categories/${child.slug}`}
                      className="flex items-center gap-3 rounded-[1.1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)] p-3 transition hover:border-[var(--color-brand)]"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-[0.9rem] bg-[rgba(244,243,238,0.92)]">
                        <FallbackImage
                          src={child.image_url || storefrontBannerFallback}
                          fallbackSrc={storefrontBannerFallback}
                          alt={child.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                          Child Category
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                          {child.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="image-shell rounded-[1.8rem]">
              <div className="aspect-[1.18] overflow-hidden">
                <FallbackImage
                  src={category?.image_url || storefrontBannerFallback}
                  fallbackSrc={storefrontBannerFallback}
                  alt={category?.name || 'Category'}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="page-kicker">Approved Products</p>
              <h2 className="font-display mt-3 text-4xl leading-none text-[var(--color-text)] sm:text-5xl">
                {category?.name || 'Category'} Picks
              </h2>
            </div>
            <Link to="/products" className="line-link rounded-full border border-[var(--color-brand)] bg-[rgba(122,75,46,0.08)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] hover:bg-[rgba(122,75,46,0.14)]">
              View All Products
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.72)] px-6 py-10 text-center">
              <p className="page-kicker">No Approved Products Yet</p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-soft)]">
                This category is ready, but its public collection is still taking shape. Approved products will appear here as soon as sellers assign listings to this branch of the catalog.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <article key={product.id} className="group">
                  <Link to={product?.id ? `/products/${product.id}` : '/products'}>
                    <div className="image-shell rounded-[0.9rem] transition-transform duration-300 group-hover:translate-y-[-2px]">
                      <div className="aspect-[0.82] overflow-hidden">
                        <FallbackImage
                          src={resolveProductPrimaryImage(product, fashionProductFallback)}
                          fallbackSrc={fashionProductFallback}
                          alt={product?.name || 'Product'}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </Link>

                  <div className="mt-5">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
                      {product?.category || category?.name || 'Artisan'}
                    </p>
                    <Link to={product?.id ? `/products/${product.id}` : '/products'}>
                      <h3 className="font-display mt-2 text-[1.78rem] leading-[0.98] text-[var(--color-text)]">
                        {product?.name || 'Unnamed product'}
                      </h3>
                    </Link>
                    <p className="mt-3 text-sm text-[var(--color-text-soft)]">
                      {formatCurrency(product?.price)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="site-footer mt-20 pb-10 pt-16">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="font-display text-4xl leading-none text-[var(--color-background)] sm:text-5xl">
                FLORA
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
                  <Link to="/login" className="site-footer-link text-sm">Login</Link>
                </div>
              </div>

              <div>
                <p className="site-footer-label">
                  Marketplace
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/register" className="site-footer-link text-sm">Register</Link>
                  <Link to="/favorites" className="site-footer-link text-sm">Favorites</Link>
                  <Link to="/cart" className="site-footer-link text-sm">Cart</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CategoryDetailsPage;
