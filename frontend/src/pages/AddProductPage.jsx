import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerProductForm from '../components/seller/SellerProductForm';
import { getApiErrorMessage } from '../services/api';
import categoryService from '../services/categoryService';
import productService from '../services/productService';

function revokeBlobUrl(value) {
  if (typeof value === 'string' && value.startsWith('blob:')) {
    URL.revokeObjectURL(value);
  }
}

function AddProductPage() {
  const navigate = useNavigate();
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
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    formData.image_previews.forEach(revokeBlobUrl);
  }, [formData.image_previews]);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);

      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load categories.'));
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

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
      await productService.createProduct(formData);
      navigate('/seller/products');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add product.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerProductForm
      formData={formData}
      categories={categories}
      categoriesLoading={categoriesLoading}
      error={error}
      saving={saving}
      submitLabel="Publish Product"
      title="Add Product"
      description="Create a new listing with real product media, stock quantity, and clean catalog details. New products go live immediately for approved sellers."
      moderationStatus="approved"
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
    />
  );
}

export default AddProductPage;
