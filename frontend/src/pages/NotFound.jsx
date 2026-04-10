import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.8s ease-out'
        }}>
            <div style={{
                position: 'relative',
                marginBottom: '2rem'
            }}>
                <div style={{
                    fontSize: '8rem',
                    fontWeight: 800,
                    color: 'var(--clr-brand-primary)',
                    opacity: 0.1,
                    lineHeight: 1
                }}>
                    404
                </div>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'var(--clr-text-primary)'
                }}>
                    <Search size={64} strokeWidth={1.5} style={{ color: 'var(--clr-brand-primary)' }} />
                </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Item Not Found</h1>
            <p style={{
                color: 'var(--clr-text-secondary)',
                fontSize: '1.25rem',
                maxWidth: '500px',
                marginBottom: '3rem'
            }}>
                Sorry, but we couldn't find any items matching your search. Try different keywords or browse our categories.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                    <Home size={20} />
                    Back to Home
                </Link>
                <Link to="/explore" className="btn btn-secondary" style={{ padding: '0.875rem 2rem' }}>
                    <ArrowLeft size={20} />
                    Explore All
                </Link>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default NotFound;
