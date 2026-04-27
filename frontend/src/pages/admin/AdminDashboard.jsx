import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users, ShoppingBag, Clock, CheckCircle, Trash2,
    AlertTriangle, Shield, RefreshCw, Eye
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingItems, setPendingItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

    const showMsg = (type, text) => {
        setActionMsg({ type, text });
        setTimeout(() => setActionMsg({ type: '', text: '' }), 3500);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [itemsRes, usersRes] = await Promise.all([
                axios.get('/api/admin/items'),
                axios.get('/api/admin/users'),
            ]);
            const items = itemsRes.data;
            setPendingItems(items.filter(i => !i.isApproved));
            setAllItems(items);
            setAllUsers(usersRes.data);
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleApprove = async (id) => {
        try {
            await axios.put(`/api/admin/items/${id}/approve`);
            showMsg('success', 'Item approved and is now publicly visible!');
            fetchData();
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to approve item');
        }
    };

    const handleRemoveItem = async (id) => {
        if (!window.confirm('Remove this item permanently?')) return;
        try {
            await axios.delete(`/api/admin/items/${id}`);
            showMsg('success', 'Item removed successfully.');
            fetchData();
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to remove item');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user and all their listings? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            showMsg('success', 'User and their listings deleted.');
            fetchData();
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to delete user');
        }
    };

    const tabs = [
        { id: 'pending', label: 'Pending Approvals', icon: Clock, count: pendingItems.length },
        { id: 'products', label: 'All Products', icon: ShoppingBag, count: allItems.length },
        { id: 'users', label: 'Users', icon: Users, count: allUsers.length },
    ];

    const tabStyle = (id) => ({
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
        fontWeight: activeTab === id ? 600 : 500, cursor: 'pointer',
        border: 'none', fontSize: '0.95rem', transition: 'all 0.18s',
        backgroundColor: activeTab === id ? 'var(--clr-brand-primary)' : 'transparent',
        color: activeTab === id ? 'white' : 'var(--clr-text-secondary)',
    });

    const badgeStyle = (color) => ({
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
        backgroundColor: `${color}22`, color: color,
    });

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'var(--clr-brand-primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
                        <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.875rem' }}>
                            Logged in as <strong>{user?.email}</strong>
                        </p>
                    </div>
                </div>
                <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Pending Review', value: pendingItems.length, icon: Clock, color: '#f59e0b' },
                    { label: 'Total Products', value: allItems.length, icon: ShoppingBag, color: '#6366f1' },
                    { label: 'Total Users', value: allUsers.length, icon: Users, color: '#10b981' },
                    { label: 'Approved Items', value: allItems.filter(i => i.isApproved).length, icon: CheckCircle, color: '#06b6d4' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: `${color}22`, color, padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', marginTop: '0.25rem' }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alert Message */}
            {actionMsg.text && (
                <div style={{
                    padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
                    backgroundColor: actionMsg.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    color: actionMsg.type === 'success' ? 'var(--clr-success)' : 'var(--clr-error)',
                    fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    {actionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {actionMsg.text}
                </div>
            )}

            {/* Tab Bar */}
            <div className="glass-panel" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {tabs.map(({ id, label, icon: Icon, count }) => (
                    <button key={id} style={tabStyle(id)} onClick={() => setActiveTab(id)}>
                        <Icon size={17} />
                        {label}
                        {count > 0 && (
                            <span style={{
                                ...badgeStyle(activeTab === id ? 'white' : 'var(--clr-brand-primary)'),
                                backgroundColor: activeTab === id ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.15)',
                            }}>{count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>
                    Loading data...
                </div>
            ) : (
                <>
                    {/* ── PENDING APPROVALS ── */}
                    {activeTab === 'pending' && (
                        <div>
                            {pendingItems.length === 0 ? (
                                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                                    <CheckCircle size={48} style={{ color: 'var(--clr-success)', marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.1rem' }}>No items pending approval. All caught up!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {pendingItems.map(item => (
                                        <div key={item._id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                                            <img
                                                src={item.images?.[0] || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=No+Image'}
                                                alt={item.title}
                                                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{item.title}</span>
                                                    <span style={badgeStyle('#f59e0b')}>Pending</span>
                                                </div>
                                                <div style={{ color: 'var(--clr-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                                    By <strong>{item.seller?.name}</strong> ({item.seller?.email}) · {item.category} · Rs {item.price?.toLocaleString()}
                                                </div>
                                                <div style={{ color: 'var(--clr-text-tertiary)', fontSize: '0.8rem', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.description}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => navigate(`/items/${item._id}`)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                    title="Preview"
                                                >
                                                    <Eye size={15} /> Preview
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(item._id)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                >
                                                    <CheckCircle size={15} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--clr-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                                                >
                                                    <Trash2 size={15} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ALL PRODUCTS ── */}
                    {activeTab === 'products' && (
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--clr-border)', backgroundColor: 'var(--clr-bg-tertiary)' }}>
                                            {['Item', 'Seller', 'Category', 'Price', 'Status', 'Approved', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--clr-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allItems.map((item, idx) => (
                                            <tr key={item._id} style={{ borderBottom: '1px solid var(--clr-border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--clr-bg-tertiary)' }}>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <img src={item.images?.[0] || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=?'} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                                                        <span style={{ fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{item.title}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--clr-text-secondary)', whiteSpace: 'nowrap' }}>{item.seller?.name}</td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--clr-text-secondary)' }}>{item.category}</td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Rs {item.price?.toLocaleString()}</td>
                                                <td style={{ padding: '0.85rem 1rem' }}><span style={badgeStyle(item.status === 'Available' ? '#10b981' : '#94a3b8')}>{item.status}</span></td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <span style={badgeStyle(item.isApproved ? '#10b981' : '#f59e0b')}>
                                                        {item.isApproved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        {!item.isApproved && (
                                                            <button onClick={() => handleApprove(item._id)} title="Approve" style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                <CheckCircle size={13} /> Approve
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleRemoveItem(item._id)} title="Delete" style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--clr-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                                                            <Trash2 size={13} /> Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allItems.length === 0 && (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>No items found.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── USERS ── */}
                    {activeTab === 'users' && (
                        <div className="glass-panel" style={{ overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--clr-border)', backgroundColor: 'var(--clr-bg-tertiary)' }}>
                                            {['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--clr-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((u, idx) => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid var(--clr-border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--clr-bg-tertiary)' }}>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: u.role === 'admin' ? 'var(--clr-brand-primary)' : 'var(--clr-bg-tertiary)', color: u.role === 'admin' ? 'white' : 'var(--clr-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                                                            {u.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--clr-text-secondary)' }}>{u.email}</td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <span style={badgeStyle(u.role === 'admin' ? '#6366f1' : '#10b981')}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <span style={badgeStyle(u.isVerified ? '#10b981' : '#f59e0b')}>
                                                        {u.isVerified ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: 'var(--clr-text-secondary)', whiteSpace: 'nowrap' }}>
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    {u._id !== user?._id ? (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            style={{ padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--clr-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
                                                        >
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-tertiary)', fontStyle: 'italic' }}>You</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allUsers.length === 0 && (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>No users found.</div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
