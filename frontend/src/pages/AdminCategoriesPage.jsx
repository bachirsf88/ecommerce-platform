import { useEffect, useMemo, useState } from 'react';
import FallbackImage from '../components/common/FallbackImage';
import storefrontBannerFallback from '../assets/storefront-banner-fallback.jpg';
import { getApiErrorMessage } from '../services/api';
import categoryService from '../services/categoryService';
import { formatDateTime } from '../utils/formatters';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  parent_id: '',
  status: 'active',
  image: null,
  image_url: '',
};

function buildCategoryTree(categories = []) {
  const topLevelCategories = categories.filter((category) => !category.parent_id);
  const childCategories = categories.filter((category) => category.parent_id);

  return topLevelCategories.map((parent) => ({
    ...parent,
    children: childCategories.filter((child) => String(child.parent_id) === String(parent.id)),
  }));
}

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await categoryService.getAdminCategories();
      setCategories(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load categories.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const parentOptions = useMemo(
    () => categories.filter((category) => String(category.id) !== String(editingId || '')),
    [categories, editingId]
  );
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const orderedCategories = useMemo(
    () => categoryTree.flatMap((category) => [category, ...(category.children || []).map((child) => ({ ...child, _isChildCard: true }))]),
    [categoryTree]
  );

  const activeCount = categories.filter((category) => category.status === 'active').length;
  const inactiveCount = categories.filter((category) => category.status === 'inactive').length;
  const imagePreviewUrl = useMemo(() => {
    if (formData.image instanceof File) {
      return URL.createObjectURL(formData.image);
    }

    return formData.image_url || storefrontBannerFallback;
  }, [formData.image, formData.image_url]);

  useEffect(() => {
    return () => {
      if (formData.image instanceof File && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [formData.image, imagePreviewUrl]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFormData((current) => ({ ...current, image: file }));
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      parent_id: category.parent_id ? String(category.parent_id) : '',
      status: category.status || 'active',
      image: null,
      image_url: category.image_url || '',
    });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
      } else {
        await categoryService.createCategory(formData);
      }

      await loadCategories();
      resetForm();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save category.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (category) => {
    setActionLoadingId(String(category.id));
    setError('');

    try {
      if (category.status === 'active') {
        await categoryService.deactivateCategory(category.id);
      } else {
        await categoryService.activateCategory(category.id);
      }

      await loadCategories();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update category status.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    setActionLoadingId(String(category.id));
    setError('');

    try {
      await categoryService.deleteCategory(category.id);
      await loadCategories();

      if (String(editingId || '') === String(category.id)) {
        resetForm();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete category.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Catalog Structure</span>
        <h1 className="section-title mt-4">Categories</h1>
        <p className="subtle-copy mt-3 max-w-3xl text-sm">
          Create the category tree sellers will use for product submissions and keep public browsing tied to structured, admin-managed catalog data.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Total Categories</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{categories.length}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Active</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{activeCount}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Inactive</p>
            <p className="font-display mt-3 text-[2rem] leading-none text-[var(--color-text)]">{inactiveCount}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="section-label">Editor</span>
              <h2 className="section-title mt-4">{editingId ? 'Edit Category' : 'Create Category'}</h2>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="btn-base btn-outline">
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div>
            <label htmlFor="category-name" className="field-label">Name</label>
            <input id="category-name" name="name" value={formData.name} onChange={handleChange} required className="text-input" />
          </div>

          <div>
            <label htmlFor="category-slug" className="field-label">Slug</label>
            <input id="category-slug" name="slug" value={formData.slug} onChange={handleChange} required className="text-input" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category-parent" className="field-label">Parent Category</label>
              <select id="category-parent" name="parent_id" value={formData.parent_id} onChange={handleChange} className="text-input">
                <option value="">No parent</option>
                {parentOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.parent?.name ? `${category.parent.name} / ${category.name}` : category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category-status" className="field-label">Status</label>
              <select id="category-status" name="status" value={formData.status} onChange={handleChange} className="text-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category-description" className="field-label">Description</label>
            <textarea id="category-description" name="description" value={formData.description} onChange={handleChange} rows="3" className="text-input" />
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)]">
              <div className="aspect-[1.15] bg-[rgba(244,243,238,0.92)]">
                <FallbackImage
                  src={imagePreviewUrl}
                  fallbackSrc={storefrontBannerFallback}
                  alt={formData.name || 'Category preview'}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category-image" className="field-label">Category Image</label>
              <input
                id="category-image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="text-input file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(188,184,177,0.28)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text)]"
              />
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-soft)]">
                Use a calm visual that helps the category feel recognizable in the home collections, product filters, and public category pages.
              </p>
            </div>
          </div>

          {error ? <div className="status-message status-error">{error}</div> : null}

          <button type="submit" disabled={saving} className="btn-base btn-primary w-full">
            {saving ? 'Saving...' : editingId ? 'Save Category' : 'Create Category'}
          </button>
        </form>

        <div className="space-y-4">
          {loading ? <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">Loading categories...</div> : null}

          {!loading && categories.length === 0 ? (
            <div className="empty-state">No categories yet. Create the first category to start structuring the catalog.</div>
          ) : null}

          {!loading && categories.length > 0 ? (
            orderedCategories.map((category) => {
              const isBusy = actionLoadingId === String(category.id);

              return (
                <article
                  key={category.id}
                  className={`data-card ${category._isChildCard ? 'border-[rgba(188,184,177,0.55)] bg-[rgba(255,255,255,0.76)] md:ml-8' : ''}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[rgba(244,243,238,0.9)]">
                        <FallbackImage
                          src={category.image_url || storefrontBannerFallback}
                          fallbackSrc={storefrontBannerFallback}
                          alt={category.name || 'Category'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        {category._isChildCard ? (
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                            Child Category
                          </p>
                        ) : null}
                        <p className="font-display text-3xl leading-none">{category.name}</p>
                        <p className="mt-2 text-sm text-[var(--color-text-soft)]">
                          Slug: {category.slug}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                          Parent: {category.parent?.name || 'Top-level category'}
                        </p>
                      </div>
                    </div>

                    <span className="status-pill">{category.status}</span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-soft)] sm:grid-cols-2 xl:grid-cols-4">
                    <p>Children: {category.children_count ?? 0}</p>
                    <p>Created: {formatDateTime(category.created_at)}</p>
                    <p>Updated: {formatDateTime(category.updated_at)}</p>
                    <p>ID: {category.id}</p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-soft)]">
                    {category.description || 'No category description provided.'}
                  </p>

                  {!category._isChildCard && category.children?.length ? (
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {category.children.map((child) => (
                        <div key={child.id} className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.76)] p-3">
                          <div className="h-12 w-12 overflow-hidden rounded-[0.85rem] bg-[rgba(244,243,238,0.92)]">
                            <FallbackImage
                              src={child.image_url || storefrontBannerFallback}
                              fallbackSrc={storefrontBannerFallback}
                              alt={child.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {child.name}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-faint)]">
                              {child.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleEdit(category)} className="btn-base btn-outline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(category)}
                      disabled={isBusy}
                      className="btn-base btn-primary"
                    >
                      {isBusy ? 'Updating...' : category.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={isBusy}
                      className="btn-base btn-danger"
                    >
                      {isBusy ? 'Working...' : 'Delete'}
                    </button>
                  </div>
                </article>
              );
            })
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default AdminCategoriesPage;
