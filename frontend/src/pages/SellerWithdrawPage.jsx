import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sellerFinanceService from '../services/sellerFinanceService';
import { formatCurrency } from '../utils/formatters';

function SellerWithdrawPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    payout_method: 'Bank transfer',
    destination_account: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await sellerFinanceService.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load withdrawal data.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await sellerFinanceService.requestWithdrawal({
        amount: Number(formData.amount),
        payout_method: formData.payout_method,
        destination_account: formData.destination_account,
        notes: formData.notes,
      });

      setMessage('Withdrawal request submitted successfully.');
      setTimeout(() => {
        navigate('/seller/finance');
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit withdrawal request.');
    } finally {
      setSaving(false);
    }
  };

  const availableBalance = overview?.summary?.available_balance ?? 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="surface-card p-6 sm:p-7">
        <span className="section-label">Withdraw Funds</span>
        <h1 className="section-title mt-4">Request Withdrawal</h1>
        <p className="subtle-copy mt-3 text-sm">
          This MVP creates an internal withdrawal request record. It does not trigger an external payout transfer automatically.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="amount" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Amount
            </label>
            <input id="amount" name="amount" type="number" min="0.01" step="0.01" value={formData.amount} onChange={handleChange} required className="text-input" />
          </div>

          <div>
            <label htmlFor="payout_method" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Payout Method
            </label>
            <select id="payout_method" name="payout_method" value={formData.payout_method} onChange={handleChange} className="text-input">
              <option value="Bank transfer">Bank transfer</option>
              <option value="Mobile wallet">Mobile wallet</option>
              <option value="Cash pickup">Cash pickup</option>
            </select>
          </div>

          <div>
            <label htmlFor="destination_account" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Destination Account / Details
            </label>
            <textarea id="destination_account" name="destination_account" rows="4" value={formData.destination_account} onChange={handleChange} required className="text-input" />
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-[rgba(2,2,2,0.72)]">
              Notes
            </label>
            <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleChange} className="text-input" />
          </div>

          {error ? <div className="status-message status-error">{error}</div> : null}
          {message ? <div className="status-message status-success">{message}</div> : null}

          <button type="submit" disabled={saving || loading} className="btn-base btn-primary w-full">
            {saving ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </section>

      <aside className="surface-card-strong p-6 sm:p-7">
        <span className="section-label">Available Balance</span>
        <h2 className="font-display mt-4 text-[2.5rem] leading-none text-[var(--color-primary)]">
          {formatCurrency(availableBalance)}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[rgba(88,78,72,0.82)]">
          Pending requests are already considered in the balance calculation so you do not accidentally over-request funds.
        </p>

        <div className="mt-8 space-y-3">
          <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.6)] px-4 py-3 text-sm text-[rgba(56,48,43,0.78)]">
            Withdrawal requests remain internal records until a real payout workflow is added.
          </div>
          <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.6)] px-4 py-3 text-sm text-[rgba(56,48,43,0.78)]">
            Use clear destination details so payout processing can be reviewed easily later.
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SellerWithdrawPage;
