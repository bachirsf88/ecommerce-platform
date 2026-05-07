import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import fashionProductFallback from '../assets/fashion-product-fallback.jpg';
import FallbackImage from '../components/common/FallbackImage';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import productService from '../services/productService';
import { formatCurrency } from '../utils/formatters';
import { resolveProductPrimaryImage } from '../utils/media';

const moderationStatuses = ['approved', 'needs_review', 'inactive', 'rejected', 'pending'];

const moderationStatusLabels = {
  approved: 'Approved',
  needs_review: 'Needs Review',
  inactive: 'Inactive',
  rejected: 'Rejected',
  pending: 'Pending',
};

function SellerProductsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const searchQuery = searchParams.get('query') ?? '';

  const loadSellerProducts = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await productService.getMyProducts();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || t('sellerProducts.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t, user?.id]);

  useEffect(() => {
    loadSellerProducts();
  }, [loadSellerProducts]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.description?.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const stock = Number(product.stock ?? 0);
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && stock > 0 && stock <= 5) ||
        (stockFilter === 'out' && stock === 0) ||
        (stockFilter === 'healthy' && stock > 5);

      return matchesQuery && matchesStatus && matchesCategory && matchesStock;
    });
  }, [categoryFilter, products, searchQuery, statusFilter, stockFilter]);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(t('sellerProducts.deleteConfirm'));

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await productService.deleteProduct(productId);
      await loadSellerProducts();
    } catch (err) {
      setError(err.response?.data?.message || t('sellerProducts.deleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <span className="section-label">{t('sellerProducts.sectionLabel')}</span>
        <h1 className="section-title mt-5">{t('sellerProducts.title')}</h1>
        <p className="subtle-copy mt-4 max-w-2xl text-sm">
          {t('sellerProducts.description')}
        </p>
      </section>

      <section className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <label htmlFor="product-search" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              {t('common.search')}
            </label>
            <input
              id="product-search"
              type="search"
              value={searchQuery}
              onChange={(event) => {
                const nextParams = new URLSearchParams(searchParams);

                if (event.target.value.trim()) {
                  nextParams.set('query', event.target.value);
                } else {
                  nextParams.delete('query');
                }

                setSearchParams(nextParams);
              }}
              placeholder={t('sellerProducts.searchPlaceholder')}
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="status-filter" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              {t('common.status')}
            </label>
            <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="text-input">
              <option value="all">{t('sellerProducts.allStatuses')}</option>
              {moderationStatuses.map((status) => (
                <option key={status} value={status}>
                  {t(`common.status.${status}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category-filter" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              {t('common.category')}
            </label>
            <select id="category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="text-input">
              <option value="all">{t('sellerProducts.allCategories')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stock-filter" className="mb-2 block text-sm font-semibold text-[var(--color-text-soft)]">
              {t('sellerProducts.stockLevel')}
            </label>
            <select id="stock-filter" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="text-input">
              <option value="all">{t('sellerProducts.allStockLevels')}</option>
              <option value="healthy">{t('sellerProducts.healthyStock')}</option>
              <option value="low">{t('sellerProducts.lowStock')}</option>
              <option value="out">{t('sellerProducts.outOfStock')}</option>
            </select>
          </div>
        </div>
      </section>

      {error ? <div className="status-message status-error">{error}</div> : null}
      {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">{t('sellerProducts.loading')}</div> : null}

      {!loading && !error ? (
        filteredProducts.length === 0 ? (
          <div className="empty-state">{t('sellerProducts.empty')}</div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="surface-card overflow-hidden">
                <div className="aspect-[1.08] bg-[rgba(244,243,238,0.86)]">
                  <FallbackImage
                    src={resolveProductPrimaryImage(product, fashionProductFallback)}
                    fallbackSrc={fashionProductFallback}
                    alt={product.name || 'Product'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
                        {product.category || t('sellerProducts.uncategorized')}
                      </p>
                      <h2 className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">
                        {product.name || t('sellerProducts.untitledProduct')}
                      </h2>
                    </div>
                    <span className="status-pill">{t(`common.status.${product.status || 'pending'}`)}</span>
                  </div>

                  {product.status === 'needs_review' || product.status === 'rejected' ? (
                    <div className="status-message status-error mt-4">
                      {t('sellerProducts.issueNeedsCorrection')}
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-2">
                    <p>{t('sellerProducts.priceLabel', { value: formatCurrency(product.price) })}</p>
                    <p>{t('sellerProducts.stockLabel', { value: product.stock ?? 0 })}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`/seller/products/${product.id}/edit`} className="btn-base btn-outline">
                      {t('common.edit')}
                    </Link>
                    <button type="button" onClick={() => handleDelete(product.id)} className="btn-base btn-danger">
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )
      ) : null}
    </div>
  );
}

export default SellerProductsPage;
