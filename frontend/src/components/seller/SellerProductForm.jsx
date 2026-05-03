import fashionProductFallback from '../../assets/fashion-product-fallback.jpg';
import productGalleryFallback from '../../assets/product-gallery-fallback.jpg';
import FallbackImage from '../common/FallbackImage';
import { formatCurrency } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';

function buildCategoryGroups(categories = []) {
  const topLevelCategories = categories.filter((category) => !category.parent_id);
  const childCategories = categories.filter((category) => category.parent_id);

  return topLevelCategories.map((parent) => ({
    ...parent,
    children: childCategories.filter((child) => String(child.parent_id) === String(parent.id)),
  }));
}

function resolveModerationSummary(status) {
  if (status === 'needs_review' || status === 'rejected') {
    return {
      badge: 'Needs Correction',
      helper: 'This product has an issue and needs correction. Save your edits to return it to the live catalog.',
    };
  }

  if (status === 'approved') {
    return {
      badge: 'Live',
      helper: 'This product is live on the marketplace unless an admin later flags it for correction.',
    };
  }

  if (status === 'inactive') {
    return {
      badge: 'Inactive',
      helper: 'This product is currently hidden from public browsing.',
    };
  }

  return {
    badge: status || 'Draft',
    helper: 'Save changes to keep this listing up to date.',
  };
}

function SellerProductForm({
  formData,
  categories = [],
  categoriesLoading = false,
  error = '',
  saving = false,
  submitLabel = 'Save Product',
  title,
  description,
  moderationStatus = '',
  onChange,
  onFileChange,
  onSubmit,
}) {
  const selectedCategoryName = categories.find(
    (category) => String(category.id) === String(formData.category_id || '')
  )?.name || formData.category || '';
  const selectedCategoryRecord = categories.find(
    (category) => String(category.id) === String(formData.category_id || '')
  ) || null;
  const categoryGroups = buildCategoryGroups(categories);
  const moderationSummary = resolveModerationSummary(moderationStatus);
  const previewImages = formData.image_previews?.length
    ? formData.image_previews
    : formData.image_urls?.length
      ? formData.image_urls
      : formData.image_url
        ? [formData.image_url]
        : [];
  const mainPreviewImage = previewImages[0] || fashionProductFallback;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card p-6 sm:p-7">
        <div>
          <span className="section-label">Product Editor</span>
          <h1 className="section-title mt-4">{title}</h1>
          <p className="subtle-copy mt-3 text-sm">{description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.86)] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
              Status: {moderationSummary.badge}
            </span>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-faint)]">
              {moderationSummary.helper}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="field-label">
              Product Name
            </label>
            <input id="name" name="name" type="text" value={formData.name} onChange={onChange} required className="text-input" />
          </div>

          <div>
            <label htmlFor="description" className="field-label">
              Description
            </label>
            <textarea id="description" name="description" value={formData.description} onChange={onChange} rows="5" className="text-input" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="field-label">
                Price
              </label>
              <input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={onChange} required className="text-input" />
            </div>

            <div>
              <label htmlFor="stock" className="field-label">
                Stock Quantity
              </label>
              <input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={onChange} required className="text-input" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-2">
              <label htmlFor="category_id" className="field-label">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                onChange={onChange}
                required
                disabled={categoriesLoading || categories.length === 0}
                className="text-input"
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                </option>
                {categoryGroups.map((category) => {
                  if (!category.children?.length) {
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    );
                  }

                  return (
                    <optgroup key={category.id} label={category.name}>
                      <option value={category.id}>{category.name}</option>
                      {category.children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {categories.length === 0 && !categoriesLoading ? (
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-faint)]">
                  No active categories are available yet. Ask an admin to create one before publishing products.
                </p>
              ) : null}
            </div>

            <div className="rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.65)] px-4 py-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
                Selected Category
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {selectedCategoryRecord?.parent?.name
                  ? `${selectedCategoryRecord.parent.name} / ${selectedCategoryRecord.name}`
                  : selectedCategoryName || 'Choose a category'}
              </p>
              {selectedCategoryRecord?.description ? (
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)] line-clamp-3">
                  {selectedCategoryRecord.description}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                  Use active admin-managed categories so products appear correctly in public browsing.
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="image_files" className="field-label">
              Product Gallery
            </label>
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--color-text-faint)]">
              Upload up to 5 images. Adding new images replaces the current gallery.
            </p>
            <input
              id="image_files"
              name="image_files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onFileChange}
              className="text-input file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(188,184,177,0.28)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text)]"
            />
          </div>

          <div>
            <p className="field-label">Product Video</p>
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--color-text-faint)]">
              Video upload will be available later.
            </p>
            <div className="rounded-[1rem] border border-dashed border-[var(--color-border)] bg-[rgba(255,255,255,0.58)] px-4 py-4 text-sm text-[var(--color-text-soft)]">
              Product videos are temporarily disabled while media storage is being finalized.
            </div>
          </div>

          {previewImages.length > 0 ? (
            <div className="space-y-3">
              <p className="field-label">Gallery Preview</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {previewImages.map((imageSrc, index) => (
                  <div key={`${imageSrc}-${index}`} className="overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.82)]">
                    <div className="aspect-[0.82] overflow-hidden bg-[rgba(244,243,238,0.82)]">
                      <FallbackImage
                        src={resolveMediaUrl(imageSrc)}
                        fallbackSrc={productGalleryFallback}
                        alt={`${formData.name || 'Product'} preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!previewImages.length ? (
            <div className="rounded-[1rem] border border-dashed border-[var(--color-border-strong)] bg-[rgba(255,255,255,0.58)] px-4 py-5 text-sm leading-6 text-[var(--color-text-soft)]">
              Add a small gallery to give the product a stronger editorial presentation across cards and detail pages.
            </div>
          ) : null}

          {previewImages.length === 0 ? (
            <div className="overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.8)]">
              <div className="aspect-[1.2] bg-[rgba(244,243,238,0.92)]">
                <FallbackImage
                  src={productGalleryFallback}
                  fallbackSrc={productGalleryFallback}
                  alt="Gallery fallback"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}

          {error ? <div className="status-message status-error">{error}</div> : null}

          <button type="submit" disabled={saving} className="btn-base btn-primary w-full">
            {saving ? 'Saving...' : submitLabel}
          </button>
        </form>
      </section>

      <aside className="surface-card-strong p-6 sm:p-7">
        <span className="section-label">Preview</span>
        <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.8)]">
          <div className="aspect-[0.92] bg-[rgba(244,243,238,0.92)]">
            <FallbackImage
              src={resolveMediaUrl(mainPreviewImage) || fashionProductFallback}
              fallbackSrc={fashionProductFallback}
              alt={formData.name || 'Product preview'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-5">
            <p className="page-kicker text-[0.62rem]">
              {selectedCategoryName || 'Category'}
            </p>
            <h2 className="font-display mt-3 text-[2rem] leading-none text-[var(--color-primary)]">
              {formData.name || 'New Product'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">
              {formData.description || 'A concise product story will appear here once you add the details.'}
            </p>
            <div className="mt-5 flex items-center justify-between text-sm text-[var(--color-text-soft)]">
              <span>{formData.stock || 0} in stock</span>
              <span>{formatCurrency(formData.price || 0)}</span>
            </div>

            {previewImages.length > 1 ? (
              <div className="mt-5 grid grid-cols-4 gap-2">
                {previewImages.slice(0, 4).map((imageSrc, index) => (
                  <div key={`aside-${imageSrc}-${index}`} className="overflow-hidden rounded-[0.9rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.88)]">
                    <div className="aspect-square overflow-hidden">
                      <FallbackImage
                        src={resolveMediaUrl(imageSrc)}
                        fallbackSrc={productGalleryFallback}
                        alt={`${formData.name || 'Product'} thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SellerProductForm;
