import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SellerProductForm from '../components/seller/SellerProductForm';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';

function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: '',
    image_file: null,
    image_preview: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const product = await productService.getProductById(id);

        if (!product || String(product.seller_id) !== String(user?.id)) {
          navigate('/seller/products', { replace: true });
          return;
        }

        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          stock: product.stock ?? '',
          category: product.category || '',
          image_url: product.image_url || '',
          image_file: null,
          image_preview: '',
          status: product.status || 'active',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadProduct();
    }
  }, [id, navigate, user?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    const previewUrl = file ? URL.createObjectURL(file) : '';

    setFormData((previous) => ({
      ...previous,
      image_file: file,
      image_preview: previewUrl,
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

  if (loading) {
    return <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading product...</div>;
  }

  return (
    <SellerProductForm
      formData={formData}
      error={error}
      saving={saving}
      submitLabel="Save Changes"
      title="Edit Product"
      description="Update stock, copy, price, category, and replace the product image when needed."
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
    />
  );
}

export default EditProductPage;
