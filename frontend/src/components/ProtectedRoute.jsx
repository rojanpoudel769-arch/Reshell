import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Props:
 *   adminOnly {boolean} — if true, only users with role "admin" can access.
 *   children  {node}   — the page to render if access is granted.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                color: 'var(--clr-text-tertiary)',
                fontSize: '1rem'
            }}>
                Loading...
            </div>
        );
    }

    // Not logged in → redirect to login, preserve intended destination
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but not admin → redirect to home
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
