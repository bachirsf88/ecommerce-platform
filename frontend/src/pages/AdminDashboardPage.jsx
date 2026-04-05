import { Link } from 'react-router-dom';

const adminSections = [
  {
    to: '/admin/users',
    label: 'Users',
    title: 'User Management',
    description: 'Review account types and marketplace access.',
  },
  {
    to: '/admin/sellers',
    label: 'Sellers',
    title: 'Seller Review',
    description: 'Approve sellers and monitor their current status.',
  },
  {
    to: '/admin/products',
    label: 'Products',
    title: 'Catalog Oversight',
    description: 'Inspect active listings and product health.',
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    title: 'Order Monitoring',
    description: 'Track transactional activity across the platform.',
  },
];

function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="hero-card p-6 sm:p-8">
        <span className="section-label">Admin Dashboard</span>
        <h1 className="section-title mt-5">Marketplace overview</h1>
        <p className="subtle-copy mt-4 max-w-2xl text-sm">
          Start from the main sidebar, then work inside one section at a time. This dashboard now acts as a clean launch point instead of duplicating navigation everywhere.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminSections.map((item) => (
          <Link key={item.to} to={item.to} className="surface-card p-5">
            <span className="status-pill">{item.label}</span>
            <h2 className="font-display mt-4 text-[2rem] leading-none text-[var(--color-primary)]">
              {item.title}
            </h2>
            <p className="subtle-copy mt-4 text-sm">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default AdminDashboardPage;
