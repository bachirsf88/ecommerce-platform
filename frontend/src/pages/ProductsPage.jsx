import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FilterPanel from '../components/FilterPanel';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';

function ProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const extractCategories = (items) => {
    return [...new Set(
      items
        .map((product) => product?.category)
        .filter(Boolean)
    )];
  };

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await productService.getProducts();
      setProducts(data);
      setCategories(extractCategories(data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      if (!searchTerm.trim()) {
        if (selectedCategory) {
          const data = await productService.filterProducts(selectedCategory);
          setProducts(data);
        } else {
          await loadProducts();
        }

        return;
      }

      const result = await productService.searchProducts(searchTerm.trim());

      if (selectedCategory) {
        setProducts(
          result.filter((product) => product.category === selectedCategory)
        );
      } else {
        setProducts(result);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search products.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    setError('');

    try {
      if (!selectedCategory) {
        if (searchTerm.trim()) {
          await handleSearch();
        } else {
          await loadProducts();
        }

        return;
      }

      if (searchTerm.trim()) {
        const result = await productService.searchProducts(searchTerm.trim());

        setProducts(
          result.filter((product) => product.category === selectedCategory)
        );
      } else {
        const data = await productService.filterProducts(selectedCategory);
        setProducts(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to filter products.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = async () => {
    setSearchTerm('');
    setSelectedCategory('');
    await loadProducts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div>
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Catalog
              </span>
              <h1 className="mt-4 text-3xl font-bold text-slate-900">
                Discover Products
              </h1>
              <p className="mt-3 max-w-2xl text-base text-gray-600">
                Browse products, search by keyword, or filter by category.
              </p>
            </div>

            {isAuthenticated && user?.role === 'buyer' && (
              <div className="flex gap-2">
                <Link to="/favorites" className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium">
                  Favorites
                </Link>
                <Link to="/cart" className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium">
                  Cart
                </Link>
                <Link to="/orders" className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium">
                  Orders
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
            />
          </div>

          <FilterPanel
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onApplyFilter={handleFilter}
            onClearFilter={handleClearFilter}
          />
        </div>

        {!loading && !error && products.length > 0 && (
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{products.length}</span> products
            </p>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading products...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            No products found.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
