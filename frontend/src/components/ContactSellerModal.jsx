import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Mail, Send, CheckCircle } from 'lucide-react';

const ContactSellerModal = ({ item, onClose }) => {
    const [body, setBody] = useState(`Hi, I'm interested in your listing "${item.title}". Is it still available?`);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Prevent body scroll while modal open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!body.trim()) { setError('Please write a message.'); return; }
        setLoading(true);
        try {
            await axios.post('/api/messages', { itemId: item._id, body });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            id="contact-seller-overlay"
            onClick={(e) => { if (e.target.id === 'contact-seller-overlay') onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                animation: 'fadeIn 0.2s ease',
                overflowY: 'auto',
            }}
        >
            <div
                className="glass-panel"
                style={{
                    width: '100%', maxWidth: '520px',
                    padding: '2rem',
                    border: '1px solid var(--clr-border)',
                    animation: 'slideUp 0.25s ease',
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    margin: 'auto',
                }}
            >
                {/* Close button */}
                <button
                    id="close-contact-modal"
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--clr-text-tertiary)', padding: '0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-tertiary)'}
                >
                    <X size={20} />
                </button>

                {success ? (
                    /* Success State */
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        <div style={{
                            width: '4rem', height: '4rem', borderRadius: '50%',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <CheckCircle size={36} color="var(--clr-success)" />
                        </div>
                        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Message Sent!</h2>
                        <p style={{ color: 'var(--clr-text-secondary)', marginBottom: '1.5rem' }}>
                            Your message has been sent to <strong>{item.seller?.name}</strong>. They'll get back to you soon.
                        </p>
                        <button
                            id="close-success-modal"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    /* Form State */
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                padding: '0.6rem', borderRadius: 'var(--radius-md)',
                                color: 'var(--clr-brand-primary)',
                            }}>
                                <Mail size={22} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Contact Seller</h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)', margin: 0 }}>
                                    Send a message to <strong>{item.seller?.name}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Item preview */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                            backgroundColor: 'var(--clr-bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.75rem',
                            marginBottom: '1.5rem',
                            border: '1px solid var(--clr-border)',
                        }}>
                            <img
                                src={item.images?.[0] || 'https://via.placeholder.com/60?text=Item'}
                                alt={item.title}
                                style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.title}
                                </div>
                                <div style={{ color: 'var(--clr-brand-primary)', fontWeight: 700, fontSize: '1rem' }}>
                                    Rs. {item.price?.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} id="contact-seller-form">
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--clr-text-secondary)' }}>
                                Your Message
                            </label>
                            <textarea
                                id="contact-seller-message"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={3}
                                placeholder="Write your message here..."
                                style={{
                                    width: '100%', padding: '0.875rem',
                                    backgroundColor: 'var(--clr-bg-secondary)',
                                    border: `1px solid ${error ? 'var(--clr-error)' : 'var(--clr-border)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--clr-text-primary)',
                                    fontSize: '0.9rem', resize: 'vertical',
                                    outline: 'none', fontFamily: 'inherit',
                                    transition: 'border-color var(--transition-fast)',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--clr-brand-primary)'}
                                onBlur={e => e.target.style.borderColor = error ? 'var(--clr-error)' : 'var(--clr-border)'}
                            />
                            {error && (
                                <p style={{ color: 'var(--clr-error)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    id="send-message-btn"
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={loading}
                                >
                                    <Send size={16} />
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ContactSellerModal;
