import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldShowNavbar =
    !hideNavbarRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/seller') &&
    !location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      {shouldShowNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default App;
