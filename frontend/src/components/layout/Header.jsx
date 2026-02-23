import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, ShoppingBag, User, LogOut, Menu } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', height: '80px' }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
                    <div style={{ backgroundColor: 'var(--clr-brand-primary)', color: 'white', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                        <ShoppingBag size={24} />
                    </div>
                    Reshell
                </Link>

                {/* Navigation - Desktop */}
                <nav style={{ display: 'none', gap: '2rem' }} className="nav-desktop">
                    <Link to="/explore" style={{ fontWeight: 500, color: 'var(--clr-text-secondary)' }}>Explore</Link>
                    <Link to="/categories" style={{ fontWeight: 500, color: 'var(--clr-text-secondary)' }}>Categories</Link>
                    <Link to="/about" style={{ fontWeight: 500, color: 'var(--clr-text-secondary)' }}>About</Link>
                </nav>

                {/* Search & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    <div style={{ position: 'relative', display: 'none' }} className="search-desktop">
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="form-input"
                            style={{ paddingLeft: '2.5rem', width: '250px', borderRadius: 'var(--radius-full)' }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-tertiary)' }} />
                    </div>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/sell" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sell Item</Link>
                            <Link to="/profile" style={{ color: 'var(--clr-text-secondary)' }}><User size={24} /></Link>
                            <button onClick={handleLogout} style={{ color: 'var(--clr-text-secondary)' }}><LogOut size={24} /></button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Log In</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sign Up</Link>
                        </div>
                    )}

                    {/* Mobile Menu Icon */}
                    <button className="mobile-menu-btn" style={{ display: 'block' }}>
                        <Menu size={24} color="var(--clr-text-secondary)" />
                    </button>
                </div>
            </div>

            <style>{`
        @media(min-width: 768px) {
          .nav-desktop { display: flex !important; }
          .search-desktop { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
        </header>
    );
};

export default Header;
