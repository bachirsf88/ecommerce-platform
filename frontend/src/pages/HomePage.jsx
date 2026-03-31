import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
          Graduation Project
        </p>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">
          Modern E-Commerce Dashboard
        </h1>
        <p className="max-w-3xl text-base text-gray-600">
          Browse products, manage role-based tools, and present the project through a
          clean and consistent interface.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-gray-600">Catalog</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">Products</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-gray-600">Role</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isAuthenticated ? user?.role : 'guest'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-gray-600">Current user</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isAuthenticated ? user?.name : 'Visitor'}
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Public</h2>
          <p className="mb-4 text-sm text-gray-600">
            Start browsing the catalog and access your account.
          </p>
          <div className="grid gap-3">
            <Link to="/products" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              Browse Products
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white">
                Login
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/register" className="rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white">
                Register
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Buyer</h2>
          <p className="mb-4 text-sm text-gray-600">
            Quick access to saved products, cart, and order history.
          </p>
          <div className="grid gap-3">
            <Link to="/favorites" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              Favorites
            </Link>
            <Link to="/cart" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              Cart
            </Link>
            <Link to="/orders" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              My Orders
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Seller</h2>
          <p className="mb-4 text-sm text-gray-600">
            Manage your product catalog and review incoming orders.
          </p>
          <div className="grid gap-3">
            <Link to="/seller/products" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              My Products
            </Link>
            <Link to="/seller/orders" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              Seller Orders
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Admin</h2>
          <p className="mb-4 text-sm text-gray-600">
            Open the admin area to review users, sellers, products, and orders.
          </p>
          <div className="grid gap-3">
            <Link to="/admin" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              Admin Dashboard
            </Link>
            <Link to="/admin/sellers" className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium">
              Review Sellers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
