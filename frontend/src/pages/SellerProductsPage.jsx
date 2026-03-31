import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';

function SellerProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSellerProducts = async () => {
    if (!user) {
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
    if (!authLoading && user) {
      loadSellerProducts();
    }
  }, [authLoading, user]);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

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

  if (authLoading) {
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
      <div className="mb-6 bg-white border rounded-xl shadow-sm p-6">
        <div className="flex gap-2 items-center justify-between flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-4">My Products</h1>
            <p className="text-sm text-gray-600">
              Review your product list, edit listings, or add a new product.
            </p>
          </div>
          <Link
            to="/seller/orders"
            className="bg-gray-100 px-4 py-2 rounded-md"
          >
            Seller Orders
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <Link
          to="/seller/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Add New Product
        </Link>
      </div>

      {loading && <p className="mb-4">Loading your products...</p>}
      {error && <p className="mb-4">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="border rounded bg-white p-4 shadow">
          You have not added any products yet.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div key={product.id} className="border rounded bg-white p-4 shadow">
              <h3 className="mb-4 font-bold">
                {product.name || 'Unnamed product'}
              </h3>
              <p className="mb-4">
                Category: {product.category || 'Uncategorized'}
              </p>
              <p className="mb-4">Price: ${product.price ?? 'N/A'}</p>
              <p className="mb-4">Stock: {product.stock ?? 'N/A'}</p>

              <div className="flex gap-2">
                <Link
                  to={`/seller/products/${product.id}/edit`}
                  className="border rounded bg-white p-4 shadow"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="border rounded bg-white p-4 shadow"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default SellerProductsPage;
