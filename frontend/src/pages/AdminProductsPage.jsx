import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
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

    if (!authLoading && user?.role === 'admin') {
      loadProducts();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <p className="mb-6">
          <Link to="/admin" className="bg-gray-100 px-4 py-2 rounded-md">
            Back to Admin Dashboard
          </Link>
        </p>

        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Products</h1>
          <p className="text-sm text-gray-600">
            Review all products currently available in the system.
          </p>
        </div>

        {loading && <p className="mb-4">Loading products...</p>}
        {error && <p className="mb-4">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="border rounded bg-white p-4 shadow">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <div key={product.id} className="border rounded bg-white p-4 shadow">
                <p className="mb-4 font-bold">{product.name || 'Unnamed product'}</p>
                <p className="mb-4">Seller: {product.seller?.name || 'Unknown seller'}</p>
                <p className="mb-4">Category: {product.category || 'Uncategorized'}</p>
                <p className="mb-4">Price: ${product.price ?? 'N/A'}</p>
                <p className="mb-4">Stock: {product.stock ?? 'N/A'}</p>
                <p>Status: {product.status || 'Unknown'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProductsPage;
