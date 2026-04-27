import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await axios.get(`/api/users/verify-email/${token}`);
                setStatus('success');
                setMessage(data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'center' }}>
                {status === 'loading' && (
                    <>
                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--clr-brand-primary)', marginBottom: '1rem' }} />
                        <h2>Verifying...</h2>
                        <p style={{ color: 'var(--clr-text-secondary)' }}>Please wait while we verify your email.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={48} style={{ margin: '0 auto', color: '#10B981', marginBottom: '1rem' }} />
                        <h2>Email Verified!</h2>
                        <p style={{ color: 'var(--clr-text-secondary)', marginBottom: '2rem' }}>{message}</p>
                        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%' }}>
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={48} style={{ margin: '0 auto', color: '#EF4444', marginBottom: '1rem' }} />
                        <h2>Verification Failed</h2>
                        <p style={{ color: 'var(--clr-text-secondary)', marginBottom: '2rem' }}>{message}</p>
                        <Link to="/register" className="btn btn-outline" style={{ display: 'inline-block', width: '100%' }}>
                            Back to Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
