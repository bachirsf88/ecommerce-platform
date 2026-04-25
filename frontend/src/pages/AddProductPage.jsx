import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerProductForm from '../components/seller/SellerProductForm';
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
    category: '',
    image_url: '',
    image_urls: [],
    image_files: [],
    image_previews: [],
    video_url: '',
    video_file: null,
    video_preview: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    formData.image_previews.forEach(revokeBlobUrl);
    revokeBlobUrl(formData.video_preview);
  }, [formData.image_previews, formData.video_preview]);

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

    const file = files?.[0] ?? null;

    setError('');
    setFormData((previous) => {
      revokeBlobUrl(previous.video_preview);

      return {
        ...previous,
        video_file: file,
        video_preview: file ? URL.createObjectURL(file) : '',
      };
    });
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
