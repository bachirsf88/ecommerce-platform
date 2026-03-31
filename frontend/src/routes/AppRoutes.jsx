import { Route, Routes } from 'react-router-dom';
import AddProductPage from '../pages/AddProductPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import AdminProductsPage from '../pages/AdminProductsPage';
import AdminSellersPage from '../pages/AdminSellersPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import EditProductPage from '../pages/EditProductPage';
import FavoritesPage from '../pages/FavoritesPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import ProductsPage from '../pages/ProductsPage';
import RegisterPage from '../pages/RegisterPage';
import SellerProductsPage from '../pages/SellerProductsPage';
import SellerOrderDetailsPage from '../pages/SellerOrderDetailsPage';
import SellerOrdersPage from '../pages/SellerOrdersPage';
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<ProtectedExamplePage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
        <Route path="/seller/products" element={<SellerProductsPage />} />
        <Route path="/seller/products/add" element={<AddProductPage />} />
        <Route path="/seller/products/:id/edit" element={<EditProductPage />} />
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
        <Route path="/seller/orders/:id" element={<SellerOrderDetailsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/sellers" element={<AdminSellersPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
