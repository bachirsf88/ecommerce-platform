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
          className="text-input"
        />
      </div>
      <button
        type="submit"
        className="btn-base btn-primary"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
