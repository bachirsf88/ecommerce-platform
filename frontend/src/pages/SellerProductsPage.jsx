import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import { formatCurrency } from '../utils/formatters';
import { resolveEntityImageUrl } from '../utils/media';

function SellerProductsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const searchQuery = searchParams.get('query') ?? '';

  const loadSellerProducts = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await productService.getSellerProducts(user.id);
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerProducts();
  }, [user?.id]);

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
    const confirmed = window.confirm('Delete this product from your catalog?');

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await productService.deleteProduct(productId);
      await loadSellerProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <span className="section-label">Catalog</span>
        <h1 className="section-title mt-5">Products</h1>
        <p className="subtle-copy mt-4 max-w-2xl text-sm">
          Manage active listings, refine descriptions, and keep stock levels ready for incoming orders.
        </p>
      </section>

      <section className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <label htmlFor="product-search" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Search
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
              placeholder="Search name or description"
              className="text-input"
            />
          </div>

          <div>
            <label htmlFor="status-filter" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Status
            </label>
            <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="text-input">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label htmlFor="category-filter" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Category
            </label>
            <select id="category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="text-input">
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stock-filter" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Stock Level
            </label>
            <select id="stock-filter" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="text-input">
              <option value="all">All stock levels</option>
              <option value="healthy">Healthy stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
        </div>
      </section>

      {error ? <div className="status-message status-error">{error}</div> : null}
      {loading ? <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">Loading products...</div> : null}

      {!loading && !error ? (
        filteredProducts.length === 0 ? (
          <div className="empty-state">No products match the current filters.</div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="surface-card overflow-hidden">
                <div className="aspect-[1.08] bg-[rgba(241,235,229,0.74)]">
                  <img
                    src={resolveEntityImageUrl(product.image_url, product.image) || heroImage}
                    alt={product.name || 'Product'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[rgba(112,100,92,0.82)]">
                        {product.category || 'Uncategorized'}
                      </p>
                      <h2 className="font-display mt-3 text-[2rem] leading-none text-[var(--color-primary)]">
                        {product.name || 'Untitled product'}
                      </h2>
                    </div>
                    <span className="status-pill">{product.status || 'active'}</span>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm text-[rgba(56,48,43,0.78)] sm:grid-cols-2">
                    <p>Price: {formatCurrency(product.price)}</p>
                    <p>Stock: {product.stock ?? 0}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`/seller/products/${product.id}/edit`} className="btn-base btn-outline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => handleDelete(product.id)} className="btn-base btn-danger">
                      Delete
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
