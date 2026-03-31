function SearchBar({ value, onChange, onSearch }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search products by name, description, or category"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-700"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
