import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerProductForm from '../components/seller/SellerProductForm';
import productService from '../services/productService';

function AddProductPage() {
  const navigate = useNavigate();
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      await productService.createProduct(formData);
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerProductForm
      formData={formData}
      error={error}
      saving={saving}
      submitLabel="Publish Product"
      title="Add Product"
      description="Create a new listing with real product media, stock quantity, and clean catalog details."
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
    />
  );
}

export default AddProductPage;
