import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Products</span>
        <h1 className="section-title mt-4">Catalog Review</h1>
        <p className="subtle-copy mt-3 text-sm">
          Stay inside the catalog section while reviewing listings, stock, and seller attribution.
        </p>
      </section>

      {loading ? <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">Loading products...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        products.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => (
              <div key={product.id} className="data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl leading-none">{product.name || 'Unnamed product'}</p>
                    <p className="mt-2 text-sm text-[rgba(2,2,2,0.62)]">
                      Seller: {product.seller?.name || 'Unknown seller'}
                    </p>
                  </div>
                  <span className="status-pill">{product.status || 'Unknown'}</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[rgba(2,2,2,0.68)] sm:grid-cols-3">
                  <p>Category: {product.category || 'Uncategorized'}</p>
                  <p>Price: ${product.price ?? 'N/A'}</p>
                  <p>Stock: {product.stock ?? 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminProductsPage;
