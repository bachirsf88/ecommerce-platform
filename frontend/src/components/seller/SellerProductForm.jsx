import heroImage from '../../assets/hero.png';
import { resolveMediaUrl } from '../../utils/media';

function SellerProductForm({
  formData,
  error = '',
  saving = false,
  submitLabel = 'Save Product',
  title,
  description,
  onChange,
  onFileChange,
  onSubmit,
}) {
  const previewUrl = formData.image_preview || formData.image_url;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card p-6 sm:p-7">
        <div>
          <span className="section-label">Product Editor</span>
          <h1 className="section-title mt-4">{title}</h1>
          <p className="subtle-copy mt-3 text-sm">{description}</p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="field-label">
                Category
              </label>
              <input id="category" name="category" type="text" value={formData.category} onChange={onChange} required className="text-input" />
            </div>

            <div>
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select id="status" name="status" value={formData.status} onChange={onChange} className="text-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="image_file" className="field-label">
              Upload Product Image
            </label>
            <input id="image_file" name="image_file" type="file" accept="image/*" onChange={onFileChange} className="text-input file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(188,184,177,0.28)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-text)]" />
          </div>

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
            <img
              src={resolveMediaUrl(previewUrl) || heroImage}
              alt={formData.name || 'Product preview'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-5">
            <p className="page-kicker text-[0.62rem]">
              {formData.category || 'Category'}
            </p>
            <h2 className="font-display mt-3 text-[2rem] leading-none text-[var(--color-primary)]">
              {formData.name || 'New Product'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">
              {formData.description || 'A concise product story will appear here once you add the details.'}
            </p>
            <div className="mt-5 flex items-center justify-between text-sm text-[var(--color-text-soft)]">
              <span>{formData.stock || 0} in stock</span>
              <span>{formData.price ? `$${Number(formData.price).toFixed(2)}` : '$0.00'}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SellerProductForm;
