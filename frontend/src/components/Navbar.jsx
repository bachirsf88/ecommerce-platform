import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const getLinkClassName = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <NavLink to="/" className="text-xl font-bold text-slate-900">
            GradShop
          </NavLink>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={getLinkClassName}>
              Home
            </NavLink>
            <NavLink to="/products" className={getLinkClassName}>
              Products
            </NavLink>

            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={getLinkClassName}>
                  Login
                </NavLink>
                <NavLink to="/register" className={getLinkClassName}>
                  Register
                </NavLink>
              </>
            )}

            {user?.role === 'buyer' && (
              <>
                <NavLink to="/favorites" className={getLinkClassName}>
                  Favorites
                </NavLink>
                <NavLink to="/cart" className={getLinkClassName}>
                  Cart
                </NavLink>
                <NavLink to="/orders" className={getLinkClassName}>
                  Orders
                </NavLink>
              </>
            )}

            {user?.role === 'seller' && (
              <>
                <NavLink to="/seller/products" className={getLinkClassName}>
                  My Products
                </NavLink>
                <NavLink to="/seller/orders" className={getLinkClassName}>
                  Seller Orders
                </NavLink>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <NavLink to="/admin" className={getLinkClassName}>
                  Admin Dashboard
                </NavLink>
                <NavLink to="/admin/users" className={getLinkClassName}>
                  Users
                </NavLink>
                <NavLink to="/admin/sellers" className={getLinkClassName}>
                  Sellers
                </NavLink>
                <NavLink to="/admin/products" className={getLinkClassName}>
                  Products
                </NavLink>
                <NavLink to="/admin/orders" className={getLinkClassName}>
                  Orders
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
