import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';

function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notOwner, setNotOwner] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!user) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const product = await productService.getProductById(id);

        if (!product || String(product.seller_id) !== String(user.id)) {
          setNotOwner(true);
          return;
        }

        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          stock: product.stock ?? '',
          category: product.category || '',
          image: product.image || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadProduct();
    }
  }, [authLoading, id, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await productService.updateProduct(id, formData);
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="border rounded bg-white p-6 shadow">
          Checking user...
        </div>
      </div>
    );
  }

  if (user?.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  if (notOwner) {
    return <Navigate to="/seller/products" replace />;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="border rounded bg-white p-6 shadow">
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-sm text-gray-600">
          Update product details and keep your listing polished.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
              <div className="w-full">
                <label htmlFor="price" className="mb-2 block text-sm font-medium text-slate-700">
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="w-full">
                <label htmlFor="stock" className="mb-2 block text-sm font-medium text-slate-700">
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="image" className="mb-2 block text-sm font-medium text-slate-700">
              Image
            </label>
            <input
              id="image"
              name="image"
              type="text"
              value={formData.image}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            {saving ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProductPage;
