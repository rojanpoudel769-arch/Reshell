import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const message = await register(name, email, password);
            alert(message);
            navigate('/login');
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
                        <UserPlus size={32} />
                    </div>
                    <h2>Create Account</h2>
                    <p style={{ color: 'var(--clr-text-secondary)' }}>Join Reshell and start trading</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--clr-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="John Doe"
                        />
                    </div>

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
                                minLength={5}
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

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={5}
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
