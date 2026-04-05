import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

function AdminSellersPage() {
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

    loadSellers();
  }, []);

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

  return (
    <div className="space-y-6">
      <section className="surface-card-strong p-6">
        <span className="section-label">Sellers</span>
        <h1 className="section-title mt-4">Seller Review</h1>
        <p className="subtle-copy mt-3 text-sm">
          Handle seller approvals in a section that is only about seller accounts and status decisions.
        </p>
      </section>

      {loading ? <div className="surface-card p-6 text-sm text-[rgba(2,2,2,0.62)]">Loading sellers...</div> : null}
      {error ? <div className="status-message status-error">{error}</div> : null}

      {!loading && !error ? (
        sellers.length === 0 ? (
          <div className="empty-state">No sellers found.</div>
        ) : (
          <div className="grid gap-3">
            {sellers.map((seller) => (
              <div key={seller.id} className="data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl leading-none">{seller.name}</p>
                    <p className="mt-2 text-sm text-[rgba(2,2,2,0.62)]">{seller.email}</p>
                  </div>
                  <span className="status-pill">{seller.seller_status || 'N/A'}</span>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleApproveSeller(seller.id)}
                    disabled={actionLoading || seller.seller_status === 'approved'}
                    className={
                      seller.seller_status === 'approved'
                        ? 'btn-base btn-secondary'
                        : 'btn-base btn-primary'
                    }
                  >
                    {seller.seller_status === 'approved'
                      ? 'Already Approved'
                      : 'Approve Seller'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default AdminSellersPage;
