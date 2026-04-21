function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  onApplyFilter,
  onClearFilter,
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-xs">
          <label htmlFor="category" className="field-label">
            Filter by category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="text-input mt-2"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onApplyFilter}
            className="btn-base btn-primary"
          >
            Apply Filter
          </button>
          <button
            type="button"
            onClick={onClearFilter}
            className="btn-base btn-outline"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
