function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  onApplyFilter,
  onClearFilter,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-xs">
          <label htmlFor="category" className="text-sm font-medium text-slate-700">
            Filter by category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
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
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          Apply Filter
        </button>
        <button
          type="button"
          onClick={onClearFilter}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Clear
        </button>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
