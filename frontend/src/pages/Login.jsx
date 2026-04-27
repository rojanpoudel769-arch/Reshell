import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--clr-brand-primary)', marginBottom: '1rem' }}>
                        <LogIn size={32} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p style={{ color: 'var(--clr-text-secondary)' }}>Log in to your Reshell account</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--clr-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <Link to="/recovery" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
