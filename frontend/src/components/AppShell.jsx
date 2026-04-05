import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppShell({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 8) {
        setNavVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      const isScrollingDown = currentScrollY > lastScrollY;
      if (isScrollingDown && currentScrollY > 40) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function onLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="appShell appShellTopNav">
      <header className={`topNav card ${navVisible ? '' : 'navHidden'}`.trim()}>
        <div className="topNavBrand">
          <span className="brandDot" />
          <h2 className="brandTitle">Finance</h2>
        </div>

        <nav className="menu menuHorizontal">
          <NavLink to="/" end className={({ isActive }) => `menuLink ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>

          {(hasRole('analyst') || hasRole('admin')) && (
            <NavLink to="/records" className={({ isActive }) => `menuLink ${isActive ? 'active' : ''}`}>
              Records
            </NavLink>
          )}

          {hasRole('admin') && (
            <NavLink to="/users" className={({ isActive }) => `menuLink ${isActive ? 'active' : ''}`}>
              Users
            </NavLink>
          )}
        </nav>

        <div className="topNavActions">
          <div className="badge">Role: {user?.role || 'unknown'}</div>
          <button className="btn-danger" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="contentArea">{children}</main>
    </div>
  );
}

export default AppShell;
