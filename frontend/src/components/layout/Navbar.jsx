import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

/**
 * Navbar — sticky top navigation.
 * Becomes slightly opaque/blurred on scroll for a polished feel.
 * Fully responsive with a slide-down mobile menu.
 */
const Navbar = ({ onFeaturesClick, onAboutClick, onContactClick }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [scrolled,   setScrolled]     = useState(false);

  // Add shadow / backdrop blur when user scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /* ── Scroll helpers (used by landing page) ── */
  const handleNav = (cb, path) => (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (cb) cb();
    else navigate(path);
  };

  const navLinks = [
    { label: '✨ Features', cb: onFeaturesClick, path: '/#features' },
    { label: '🎓 About',    cb: onAboutClick,    path: '/#about'    },
    { label: '💌 Contact',  cb: onContactClick,  path: '/#contact'  },
  ];

  return (
    <nav
      className={[
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-card border-b border-violet-50'
          : 'bg-white/70 backdrop-blur-sm',
      ].join(' ')}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-2xl">🏠</span>
            <span
              className="text-2xl font-black"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <span className="text-coral-500">Roomie</span>
              <span className="text-violet-600">Link</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ label, cb, path }) => (
              <button
                key={label}
                onClick={handleNav(cb, path)}
                className="text-sm font-semibold text-violet-700 hover:text-coral-500 transition-colors duration-200"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {label}
              </button>
            ))}

            <div className="w-px h-5 bg-violet-200" />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="text-sm font-bold text-violet-600 hover:text-coral-500 transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  👤 {user?.name?.split(' ')[0] ?? 'Profile'}
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign up free 🎉</Button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-violet-600 hover:bg-violet-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-violet-50 shadow-card-lg animate-fade-up">
          <div className="container-custom py-4 flex flex-col gap-2">
            {navLinks.map(({ label, cb, path }) => (
              <button
                key={label}
                onClick={handleNav(cb, path)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-violet-700 font-semibold hover:bg-violet-50 transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {label}
              </button>
            ))}

            <div className="h-px bg-violet-100 my-1" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-violet-700 font-bold hover:bg-violet-50 transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  👤 My Profile
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-violet-700 font-bold hover:bg-violet-50 transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  📊 Dashboard
                </Link>
                <Button variant="outline" size="sm" fullWidth onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline-violet" size="md" fullWidth>Log in</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" size="md" fullWidth>Sign up free 🎉</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
