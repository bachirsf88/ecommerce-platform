import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SellerProductForm from '../components/seller/SellerProductForm';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import categoryService from '../services/categoryService';
import productService from '../services/productService';

function revokeBlobUrl(value) {
  if (typeof value === 'string' && value.startsWith('blob:')) {
    URL.revokeObjectURL(value);
  }
}

function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    category: '',
    image_url: '',
    image_urls: [],
    image_files: [],
    image_previews: [],
    status: 'pending',
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    formData.image_previews.forEach(revokeBlobUrl);
  }, [formData.image_previews]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const [product, categoryData] = await Promise.all([
          productService.getMyProductById(id),
          categoryService.getCategories(),
        ]);

        setCategories(categoryData);

        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          stock: product.stock ?? '',
          category_id: product.category_id ? String(product.category_id) : '',
          category: product.category || '',
          image_url: product.image_url || '',
          image_urls: Array.isArray(product.image_urls)
            ? product.image_urls
            : product.image_url
              ? [product.image_url]
              : [],
          image_files: [],
          image_previews: [],
          status: product.status || 'pending',
        });
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/seller/products', { replace: true });
          return;
        }

        setError(getApiErrorMessage(err, 'Failed to load product.'));
      } finally {
        setCategoriesLoading(false);
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
    const { name, files } = event.target;

    if (name === 'image_files') {
      const nextFiles = Array.from(files ?? []);

      if (nextFiles.length > 5) {
        setError('Upload up to 5 product images.');
        event.target.value = '';
        return;
      }

      setError('');
      setFormData((previous) => {
        previous.image_previews.forEach(revokeBlobUrl);

        return {
          ...previous,
          image_files: nextFiles,
          image_previews: nextFiles.map((file) => URL.createObjectURL(file)),
        };
      });

      return;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await productService.updateProduct(id, formData);
      navigate('/seller/products');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update product.'));
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
      categories={categories}
      categoriesLoading={categoriesLoading}
      error={error}
      saving={saving}
      submitLabel="Save Changes"
      title="Edit Product"
      description="Update stock, copy, price, category, and replace the product gallery when needed. Saving changes sends the product back for admin review."
      moderationStatus={formData.status}
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
    />
  );
}

export default EditProductPage;
