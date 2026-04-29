import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Search, ShoppingBag, User, LogOut, Menu, Heart, MessageSquare, Shield } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const { hasUnreadMessages } = useSocket() || {};
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/explore?keyword=${searchQuery}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', height: '80px' }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
                    <div style={{ backgroundColor: 'var(--clr-brand-primary)', color: 'white', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                        <ShoppingBag size={24} />
                    </div>
                    ReSell
                </Link>

                {/* Navigation - Desktop */}
                <nav style={{ display: 'none', gap: '2rem' }} className="nav-desktop">
                    <Link to="/explore" style={{ fontWeight: 500, color: 'var(--clr-text-secondary)' }}>Explore</Link>
                    <Link to="/categories" style={{ fontWeight: 500, color: 'var(--clr-text-secondary)' }}>Categories</Link>
                    <Link to="/about" style={{ fontWeight: 500, color: 'var(--clr-text-secondary)' }}>About</Link>
                    {/* {user?.role === 'admin' && (
                        <Link to="/admin" style={{ fontWeight: 600, color: 'var(--clr-brand-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Shield size={16} /> Admin Panel
                        </Link>
                    )} */}
                </nav>

                {/* Search & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    <div className="search-desktop" style={{ display: 'none', alignItems: 'center', backgroundColor: 'var(--clr-bg-secondary)', borderRadius: 'var(--radius-full)', padding: '0 0.5rem 0 1rem', border: '1px solid var(--clr-border)', width: '320px', transition: 'all var(--transition-fast)' }}>
                        <Search
                            size={18}
                            style={{ color: 'var(--clr-text-tertiary)', cursor: 'pointer' }}
                            onClick={() => {
                                if (searchQuery.trim()) {
                                    navigate(`/explore?keyword=${searchQuery}`);
                                    setSearchQuery('');
                                }
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.6rem 0.75rem', fontSize: '0.875rem', outline: 'none', color: 'var(--clr-text-primary)' }}
                        />
                    </div>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            {user.role === 'admin' ? (
                                <Link to="/admin" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Shield size={16} /> Admin Panel
                                </Link>
                            ) : (
                                <Link to="/sell" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sell Item</Link>
                            )}

                            <Link to="/messages" style={{ color: 'var(--clr-text-secondary)', display: 'flex', alignItems: 'center', position: 'relative' }} title="Messages">
                                <MessageSquare size={24} />
                                {hasUnreadMessages && (
                                    <span style={{
                                        position: 'absolute', top: '-2px', right: '-4px',
                                        width: '10px', height: '10px',
                                        backgroundColor: 'red', borderRadius: '50%'
                                    }}></span>
                                )}
                            </Link>

                            <Link to="/profile" style={{ color: 'var(--clr-text-secondary)', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Heart size={24} />
                                {user.savedItems?.length > 0 && (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: 'var(--clr-brand-primary)', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '2px 5px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                        {user.savedItems.length}
                                    </span>
                                )}
                            </Link>

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
