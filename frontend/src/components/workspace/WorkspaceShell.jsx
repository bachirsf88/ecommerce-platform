import { NavLink } from 'react-router-dom';

function WorkspaceShell({
  workspaceLabel,
  workspaceTitle,
  workspaceDescription,
  accountName,
  accountEmail,
  accountStatus,
  primaryLinks,
  sidebarSections = [],
  footerContent = null,
  topbarKicker,
  topbarTitle,
  topbarDescription,
  topbarActions = null,
  secondaryNav = null,
  children,
}) {
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar-panel">
          <div>
            <p className="workspace-sidebar-kicker">{workspaceLabel}</p>
            <h1 className="font-display text-[2.2rem] leading-[0.92] text-[var(--color-text)]">
              {workspaceTitle}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-soft)]">
              {workspaceDescription}
            </p>
          </div>

          <div className="workspace-sidebar-profile">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-faint)]">
                Account
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {accountName}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                {accountEmail}
              </p>
            </div>
            {accountStatus ? <span className="status-pill">{accountStatus}</span> : null}
          </div>

          <nav className="workspace-sidebar-nav">
            {primaryLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `workspace-nav-link ${isActive ? 'workspace-nav-link-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {sidebarSections.length > 0 ? (
            <div className="workspace-sidebar-sections">
              {sidebarSections.map((section) => (
                <div key={section.label} className="workspace-sidebar-section">
                  <p className="workspace-sidebar-section-label">{section.label}</p>
                  <div className="workspace-sidebar-nav">
                    {section.links.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `workspace-nav-link ${isActive ? 'workspace-nav-link-active' : ''}`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {footerContent ? (
            <div className="workspace-sidebar-footer">
              {footerContent}
            </div>
          ) : null}
        </div>
      </aside>

      <main className="workspace-main">
        <div className="workspace-topbar">
          <div>
            <p className="workspace-topbar-kicker">{topbarKicker}</p>
            <h2 className="font-display mt-2 text-[2.1rem] leading-[0.94] text-[var(--color-text)]">
              {topbarTitle}
            </h2>
            {topbarDescription ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-soft)]">
                {topbarDescription}
              </p>
            ) : null}
          </div>

          {topbarActions ? (
            <div className="workspace-topbar-actions">
              {topbarActions}
            </div>
          ) : null}
        </div>

        {secondaryNav ? (
          <div className="workspace-secondary-nav">
            {secondaryNav}
          </div>
        ) : null}

        <div className="workspace-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default WorkspaceShell;
