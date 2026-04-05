import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import storeService from '../services/storeService';
import { resolveMediaUrl } from '../utils/media';

function SellerStoreManagementPage() {
  const { fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    store_address: '',
    postal_code: '',
    contact_email: '',
    phone_number: '',
    logo: null,
    banner: null,
    logo_url: '',
    banner_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadStore = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await storeService.getMyStore();
        setFormData((previous) => ({
          ...previous,
          ...data,
          logo: null,
          banner: null,
          logo_url: data?.logo_image_url || data?.logo_url || '',
          banner_url: data?.banner_image_url || data?.banner_url || '',
        }));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load store profile.');
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files?.[0] ?? null;
    const previewUrl = file ? URL.createObjectURL(file) : '';

    setFormData((previous) => ({
      ...previous,
      [name]: file,
      ...(name === 'logo' ? { logo_url: previewUrl || previous.logo_url } : {}),
      ...(name === 'banner' ? { banner_url: previewUrl || previous.banner_url } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updatedStore = await storeService.updateMyStore(formData);
      await fetchUser();
      setFormData((previous) => ({
        ...previous,
        ...updatedStore,
        logo: null,
        banner: null,
        logo_url: updatedStore?.logo_image_url || updatedStore?.logo_url || previous.logo_url,
        banner_url: updatedStore?.banner_image_url || updatedStore?.banner_url || previous.banner_url,
      }));
      setMessage('Store identity updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update store profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <div id="general" className="surface-card p-6 sm:p-7 scroll-mt-32">
          <span className="section-label">General Info</span>
          <h1 className="section-title mt-4">Store Management</h1>
          <p className="subtle-copy mt-3 text-sm">
            Keep your public storefront polished with a refined description and a clear store identity foundation.
          </p>

          {loading ? <div className="mt-6 text-sm text-[rgba(2,2,2,0.62)]">Loading store profile...</div> : null}

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="store_name" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                Store Name
              </label>
              <input id="store_name" name="store_name" type="text" value={formData.store_name} onChange={handleChange} required className="text-input" />
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                Store Description
              </label>
              <textarea id="description" name="description" rows="5" value={formData.description || ''} onChange={handleChange} className="text-input" />
            </div>

            <div>
              <label htmlFor="store_address" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                Store Address
              </label>
              <textarea id="store_address" name="store_address" rows="4" value={formData.store_address} onChange={handleChange} required className="text-input" />
            </div>

            <div>
              <label htmlFor="postal_code" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                Postal Code
              </label>
              <input id="postal_code" name="postal_code" type="text" value={formData.postal_code} onChange={handleChange} required className="text-input" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div id="media" className="surface-card p-6 sm:p-7 scroll-mt-32">
            <span className="section-label">Media</span>
            <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
              Logo and banner
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="logo" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                  Store Logo
                </label>
                <input id="logo" name="logo" type="file" accept="image/*" onChange={handleFileChange} className="text-input file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(2,2,2,0.08)] file:px-4 file:py-2 file:text-sm file:font-semibold" />
              </div>

              <div>
                <label htmlFor="banner" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                  Store Banner
                </label>
                <input id="banner" name="banner" type="file" accept="image/*" onChange={handleFileChange} className="text-input file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(2,2,2,0.08)] file:px-4 file:py-2 file:text-sm file:font-semibold" />
              </div>
            </div>
          </div>

          <div id="contact" className="surface-card p-6 sm:p-7 scroll-mt-32">
            <span className="section-label">Contact Details</span>
            <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
              Contact information
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone_number" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                  Phone Number
                </label>
                <input id="phone_number" name="phone_number" type="text" value={formData.phone_number || ''} onChange={handleChange} className="text-input" />
              </div>

              <div>
                <label htmlFor="contact_email" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
                  Contact Email
                </label>
                <input id="contact_email" name="contact_email" type="email" value={formData.contact_email || ''} onChange={handleChange} className="text-input" />
              </div>
            </div>

            {error ? <div className="status-message status-error mt-6">{error}</div> : null}
            {message ? <div className="status-message status-success mt-6">{message}</div> : null}

            <button type="submit" disabled={saving || loading} className="btn-base btn-primary mt-6 w-full">
              {saving ? 'Saving...' : 'Save Store Profile'}
            </button>
          </div>
        </form>
      </section>

      <aside className="surface-card-strong overflow-hidden">
        <div className="aspect-[1.45] bg-[linear-gradient(160deg,rgba(241,235,229,0.88),rgba(224,211,201,0.86))]">
          {formData.banner_url ? (
            <img src={resolveMediaUrl(formData.banner_url)} alt={formData.store_name || 'Store banner'} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="p-6 sm:p-7">
          <div className="-mt-16 inline-flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.8rem] border border-white/70 bg-[rgba(255,253,249,0.92)] shadow-[0_18px_32px_rgba(2,2,2,0.08)]">
            {formData.logo_url ? (
              <img src={resolveMediaUrl(formData.logo_url)} alt={formData.store_name || 'Store logo'} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-[var(--color-primary)]">
                {(formData.store_name || 'S').charAt(0)}
              </span>
            )}
          </div>

          <h2 className="font-display mt-6 text-[2.3rem] leading-none text-[var(--color-primary)]">
            {formData.store_name || 'Store Preview'}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[rgba(88,78,72,0.82)]">
            {formData.description || 'Your store description will appear here after you save it.'}
          </p>

          <div className="mt-6 grid gap-3 text-sm text-[rgba(56,48,43,0.8)]">
            <p>{formData.store_address || 'Store address'}</p>
            <p>{formData.postal_code || 'Postal code'}</p>
            <p>{formData.contact_email || 'Contact email'}</p>
            <p>{formData.phone_number || 'Phone number'}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SellerStoreManagementPage;
