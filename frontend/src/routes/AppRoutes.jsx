import { Navigate, Route, Routes } from 'react-router-dom';
import AddProductPage from '../pages/AddProductPage';
import AccountPage from '../pages/AccountPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import AdminProductsPage from '../pages/AdminProductsPage';
import AdminReviewsPage from '../pages/AdminReviewsPage';
import AdminSellersPage from '../pages/AdminSellersPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminWithdrawalsPage from '../pages/AdminWithdrawalsPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import CheckoutSuccessPage from '../pages/CheckoutSuccessPage';
import EditProductPage from '../pages/EditProductPage';
import FavoritesPage from '../pages/FavoritesPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import ProductsPage from '../pages/ProductsPage';
import RegisterPage from '../pages/RegisterPage';
import SellerDashboardPage from '../pages/SellerDashboardPage';
import SellerFinancePage from '../pages/SellerFinancePage';
import SellerProductsPage from '../pages/SellerProductsPage';
import SellerOrderDetailsPage from '../pages/SellerOrderDetailsPage';
import SellerOrdersPage from '../pages/SellerOrdersPage';
import SellerSettingsPage from '../pages/SellerSettingsPage';
import SellerStoreManagementPage from '../pages/SellerStoreManagementPage';
import SellerStorefrontPage from '../pages/SellerStorefrontPage';
import SellerWithdrawPage from '../pages/SellerWithdrawPage';
import AdminLayout from '../components/admin/AdminLayout';
import SellerLayout from '../components/seller/SellerLayout';
import ProtectedRoute from './ProtectedRoute';

function ProtectedExamplePage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This is a protected example route.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailsPage />} />
      <Route path="/stores/:id" element={<SellerStorefrontPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<ProtectedExamplePage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['buyer', 'seller']} />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboardPage />} />
          <Route path="store" element={<SellerStoreManagementPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/add" element={<AddProductPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="orders/:id" element={<SellerOrderDetailsPage />} />
          <Route path="finance" element={<SellerFinancePage />} />
          <Route path="finance/withdraw" element={<SellerWithdrawPage />} />
          <Route path="settings" element={<SellerSettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="sellers" element={<AdminSellersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
