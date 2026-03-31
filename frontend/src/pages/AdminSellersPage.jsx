import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

function AdminSellersPage() {
  const { user, loading: authLoading } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSellers = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await adminService.getSellers();
        setSellers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sellers.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user?.role === 'admin') {
      loadSellers();
    }
  }, [authLoading, user]);

  const handleApproveSeller = async (sellerId) => {
    setActionLoading(true);
    setError('');

    try {
      const updatedSeller = await adminService.approveSeller(sellerId);

      setSellers((previousSellers) =>
        previousSellers.map((seller) =>
          String(seller.id) === String(sellerId) ? updatedSeller : seller
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve seller.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return <p>Checking user...</p>;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="mb-6">
          <Link to="/admin" className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium">
            Back to Admin Dashboard
          </Link>
        </p>

        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Sellers</h1>
          <p className="text-sm text-gray-600">
            Review seller accounts and approve pending sellers.
          </p>
        </div>

        {loading && <p className="mb-4">Loading sellers...</p>}
        {error && <p className="mb-4">{error}</p>}

        {!loading && !error && sellers.length === 0 && (
          <p className="border rounded bg-white p-4 shadow">No sellers found.</p>
        )}

        {!loading && !error && sellers.length > 0 && (
          <div className="flex flex-col gap-2">
            {sellers.map((seller) => (
              <div key={seller.id} className="border rounded bg-white p-4 shadow">
                <p className="mb-4 font-bold">{seller.name}</p>
                <p className="mb-4">Email: {seller.email}</p>
                <p className="mb-4">Seller Status: {seller.seller_status || 'N/A'}</p>

                <button
                  type="button"
                  onClick={() => handleApproveSeller(seller.id)}
                  disabled={
                    actionLoading || seller.seller_status === 'approved'
                  }
                  className={
                    seller.seller_status === 'approved'
                      ? 'rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700'
                      : 'rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700'
                  }
                >
                  {seller.seller_status === 'approved'
                    ? 'Already Approved'
                    : 'Approve Seller'}
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default AdminSellersPage;
