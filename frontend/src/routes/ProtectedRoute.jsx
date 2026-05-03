import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SellerApprovalState({ sellerStatus, onLogout }) {
  const isRejected = sellerStatus === 'rejected';
  const message = sellerStatus === 'rejected'
    ? 'Your seller account was rejected. Please contact the platform administrator for more information.'
    : 'Your seller account is pending admin approval. You will be able to access your seller dashboard once an admin approves your account.';

  return (
    <div className="page-shell">
      <div className="page-container max-w-[880px]">
        <div className="surface-card-strong p-8 sm:p-10">
          <span className="section-label">Seller Access</span>
          <h1 className="section-title mt-5">
            {isRejected ? 'Seller account rejected' : 'Seller account pending approval'}
          </h1>
          <p className="subtle-copy mt-4 max-w-2xl text-sm">
            {message}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className="btn-base btn-outline">
              Back Home
            </Link>
            <button type="button" onClick={onLogout} className="btn-base btn-primary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ allowedRoles = [], requireApprovedSeller = false }) {
  const location = useLocation();
  const { loading, isAuthenticated, user, logout } = useAuth();

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if (
    requireApprovedSeller &&
    user?.role === 'seller' &&
    user?.seller_status !== 'approved'
  ) {
    return <SellerApprovalState sellerStatus={user?.seller_status} onLogout={logout} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
