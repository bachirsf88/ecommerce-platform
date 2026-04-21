import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import productService from '../services/productService';
import { resolveEntityImageUrl } from '../utils/media';

const PAGE_SIZE = 6;

function ProductVisual({ product }) {
  const imageSrc = resolveEntityImageUrl(product?.image_url, product?.image);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={product?.name || 'Product'}
        className="h-full w-full object-cover object-center"
      />
    );
  }

  return (
    <img
      src={heroImage}
      alt={product?.name || 'Product'}
      className="h-full w-full object-cover object-center"
    />
  );
}

function ProductTile({ product }) {
  return (
    <article className="group">
      <Link to={product?.id ? `/products/${product.id}` : '/products'}>
        <div className="image-shell rounded-[0.9rem] transition-transform duration-300 group-hover:translate-y-[-2px]">
          <div className="aspect-[0.82] overflow-hidden">
            <ProductVisual product={product} />
          </div>
        </div>
      </Link>

      <div className="mt-5 flex items-start justify-between gap-5">
        <div className="min-w-0 pr-2">
          <Link to={product?.id ? `/products/${product.id}` : '/products'}>
            <h3 className="font-display text-[1.78rem] leading-[0.98] text-[var(--color-text)]">
              {product?.name || 'Unnamed product'}
            </h3>
          </Link>
          <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-faint)]">
            {product?.seller?.name || product?.seller_name || product?.category || 'Artisan'}
          </p>
        </div>

        <p className="whitespace-nowrap pt-1 text-[0.88rem] font-medium text-[var(--color-text-soft)]">
          ${product?.price ?? 'N/A'}
        </p>
      </div>
    </article>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product?.category).filter(Boolean))],
    [products]
  );

  const sellers = useMemo(
    () => [...new Set(
      products
        .map((product) => product?.seller?.name || product?.seller_name)
        .filter(Boolean)
    )],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm.trim()) {
      const keyword = searchTerm.trim().toLowerCase();
      result = result.filter((product) =>
        [product?.name, product?.description, product?.category, product?.seller?.name, product?.seller_name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))
      );
    }

    if (selectedCategory) {
      result = result.filter((product) => product?.category === selectedCategory);
    }

    if (selectedSeller) {
      result = result.filter(
        (product) => (product?.seller?.name || product?.seller_name) === selectedSeller
      );
    }

    if (minPrice !== '') {
      result = result.filter((product) => Number(product?.price ?? 0) >= Number(minPrice));
    }

    if (maxPrice !== '') {
      result = result.filter((product) => Number(product?.price ?? 0) <= Number(maxPrice));
    }

    if (inStockOnly) {
      result = result.filter((product) => Number(product?.stock ?? 0) > 0);
    }

    result.sort((first, second) => {
      if (sortBy === 'price-asc') {
        return Number(first?.price ?? 0) - Number(second?.price ?? 0);
      }

      if (sortBy === 'price-desc') {
        return Number(second?.price ?? 0) - Number(first?.price ?? 0);
      }

      if (sortBy === 'name') {
        return String(first?.name || '').localeCompare(String(second?.name || ''));
      }

      if (sortBy === 'stock') {
        return Number(second?.stock ?? 0) - Number(first?.stock ?? 0);
      }

      return Number(second?.id ?? 0) - Number(first?.id ?? 0);
    });

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedSeller,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSeller, minPrice, maxPrice, inStockOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const currentTitle = selectedCategory || 'Products & Collections';
  const currentDescription = selectedCategory
    ? `Explore a curated selection of ${selectedCategory.toLowerCase()} products from artisan sellers across the marketplace.`
    : 'Explore a curated selection of handmade pieces from women-led home businesses, designed for calm and refined browsing.';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeller('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="page-shell pb-0">
      <div className="page-container max-w-[1180px]">
        <section className="pt-4">
          <div className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-brand)]">
              {selectedCategory || 'Products'}
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[42rem]">
              <h1 className="font-display text-[3.5rem] leading-[0.94] text-[var(--color-text)] sm:text-[4.25rem]">
                {currentTitle}
              </h1>
              <p className="mt-6 max-w-[34rem] text-[0.98rem] leading-8 text-[var(--color-text-faint)]">
                {currentDescription}
              </p>
            </div>

            <div className="w-full lg:max-w-[210px]">
              <label
                htmlFor="sort-products"
                className="page-kicker"
              >
                Sort
              </label>
              <select
                id="sort-products"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="line-input mt-3 w-full appearance-none text-sm"
              >
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
                <option value="stock">Stock</option>
              </select>
            </div>
          </div>
        </section>

        <section className="pt-14">
          <div className="grid gap-14 lg:grid-cols-[210px_minmax(0,1fr)]">
            <aside className="space-y-10">
              <div>
                <p className="page-kicker">
                  Filters
                </p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                  Refine Collection
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text)]">
                  Search
                </p>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products"
                  className="line-input text-[0.9rem]"
                />
              </div>

              <div className="space-y-4">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text)]">
                  Categories
                </p>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`text-left text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${
                      selectedCategory === ''
                        ? 'text-[var(--color-text)]'
                        : 'text-[var(--color-text-faint)]'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`text-left text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${
                        selectedCategory === category
                          ? 'text-[var(--color-text)]'
                          : 'text-[var(--color-text-faint)]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text)]">
                  Price Range
                </p>
                <div className="grid gap-3">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="Min"
                    className="line-input text-[0.9rem]"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Max"
                    className="line-input text-[0.9rem]"
                  />
                </div>
              </div>

              {sellers.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text)]">
                    Seller
                  </p>
                  <select
                    value={selectedSeller}
                    onChange={(event) => setSelectedSeller(event.target.value)}
                    className="line-input text-[0.9rem]"
                  >
                    <option value="">All Sellers</option>
                    {sellers.map((seller) => (
                      <option key={seller} value={seller}>
                        {seller}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text)]">
                  Availability
                </p>
                <label className="flex items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) => setInStockOnly(event.target.checked)}
                    className="h-4 w-4 rounded border border-[var(--color-border-strong)] accent-[var(--color-brand)]"
                  />
                  In Stock
                </label>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="line-link text-[0.64rem] font-semibold uppercase tracking-[0.2em]"
              >
                Clear Filters
              </button>
            </aside>

            <div>
              {!loading && !error && filteredProducts.length > 0 && (
                <div className="mb-10 flex items-center justify-between gap-4">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                    Showing {filteredProducts.length} products
                  </p>
                </div>
              )}

              {loading && (
                <div className="surface-card p-6 text-sm text-[var(--color-text-soft)]">
                  Loading products...
                </div>
              )}

              {error && (
                <div className="status-message status-error">
                  {error}
                </div>
              )}

              {!loading && !error && filteredProducts.length === 0 && (
                <div className="empty-state">
                  No products found for the current selection.
                </div>
              )}

              {!loading && !error && currentItems.length > 0 && (
                <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                  {currentItems.map((product) => (
                    <ProductTile key={product.id} product={product} />
                  ))}
                </div>
              )}

              {!loading && !error && filteredProducts.length > 0 && (
                <div className="mt-20 flex items-center justify-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 disabled:opacity-40"
                  >
                    ←
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 ${currentPage === page ? 'text-[var(--color-text)]' : ''}`}
                    >
                      {String(page).padStart(2, '0')}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="site-footer mt-24 pb-10 pt-16">
        <div className="page-container max-w-[1180px]">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="font-display text-4xl leading-none text-white sm:text-5xl">
                GradShop
              </p>
              <p className="site-footer-copy mt-5 max-w-xl text-sm leading-7">
                A refined artisan marketplace for women-led home businesses, thoughtful product discovery, and handmade pieces presented with warmth and restraint.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="site-footer-label">
                  Navigate
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/" className="site-footer-link text-sm">Home</Link>
                  <Link to="/products" className="site-footer-link text-sm">Products</Link>
                  <Link to="/login" className="site-footer-link text-sm">Login</Link>
                </div>
              </div>

              <div>
                <p className="site-footer-label">
                  Marketplace
                </p>
                <div className="mt-4 grid gap-3">
                  <Link to="/register" className="site-footer-link text-sm">Register</Link>
                  <Link to="/favorites" className="site-footer-link text-sm">Favorites</Link>
                  <Link to="/cart" className="site-footer-link text-sm">Cart</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProductsPage;
