import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="border rounded bg-white p-6 shadow">Checking user...</div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Manage users, sellers, products, and orders from one clean dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/admin/users" className="bg-white border rounded-xl shadow-sm p-5">
            View Users
          </Link>
          <Link to="/admin/sellers" className="bg-white border rounded-xl shadow-sm p-5">
            View Sellers
          </Link>
          <Link to="/admin/products" className="bg-white border rounded-xl shadow-sm p-5">
            View Products
          </Link>
          <Link to="/admin/orders" className="bg-white border rounded-xl shadow-sm p-5">
            View Orders
          </Link>
        </div>
    </div>
  );
}

export default AdminDashboardPage;
