import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ItemCard from '../components/items/ItemCard';
import { User, Heart, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'listings', 'settings'
    const [myItems, setMyItems] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchUserItems = async () => {
            try {
                // Fetch user's own listings explicitly
                const res = await axios.get('/api/items');
                const userListings = res.data.items.filter(item => {
                    const sellerId = item.seller._id || item.seller;
                    return sellerId.toString() === user._id.toString();
                });
                setMyItems(userListings);
            } catch (err) {
                console.error('Error fetching user items:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserItems();
    }, [user, navigate]);

    const handleDeleteItem = async (itemId) => {
        try {
            await axios.delete(`/api/items/${itemId}`);
            setMyItems(prev => prev.filter(item => item._id !== itemId));
        } catch (err) {
            console.error('Error deleting item:', err);
            alert(err.response?.data?.message || 'Failed to delete item');
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div className="animate-fade-in profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

            {/* Sidebar Navigation */}
            <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', backgroundColor: 'var(--clr-brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, margin: '0 auto 1rem' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
                    <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', transition: 'all 0.2s', backgroundColor: activeTab === 'saved' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'saved' ? 'var(--clr-brand-primary)' : 'var(--clr-text-secondary)', fontWeight: activeTab === 'saved' ? 600 : 500 }}
                    >
                        <Heart size={20} /> Saved Items
                    </button>

                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', transition: 'all 0.2s', backgroundColor: activeTab === 'listings' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'listings' ? 'var(--clr-brand-primary)' : 'var(--clr-text-secondary)', fontWeight: activeTab === 'listings' ? 600 : 500 }}
                    >
                        <ShoppingBag size={20} /> My Listings
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', transition: 'all 0.2s', backgroundColor: activeTab === 'settings' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'settings' ? 'var(--clr-brand-primary)' : 'var(--clr-text-secondary)', fontWeight: activeTab === 'settings' ? 600 : 500 }}
                    >
                        <Settings size={20} /> Settings
                    </button>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '1rem 0' }} />

                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', color: 'var(--clr-error)', fontWeight: 500 }}
                    >
                        <LogOut size={20} /> Log Out
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div>
                {activeTab === 'saved' && (
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Heart size={24} className="text-brand" style={{ color: 'var(--clr-brand-primary)' }} /> Saved Items ({user?.savedItems?.length || 0})
                        </h2>
                        {user?.savedItems?.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>
                                <p>You haven't saved any items yet.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/explore')}>Discover Items</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {user?.savedItems?.map(item => (
                                    <ItemCard key={item._id || item} item={item._id ? item : { _id: item }} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ShoppingBag size={24} style={{ color: 'var(--clr-brand-primary)' }} /> My Listings ({myItems.length})
                            </h2>
                            <button className="btn btn-primary" onClick={() => navigate('/sell')}>List New Item</button>
                        </div>
                        {myItems.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>
                                <p>You haven't listed any items for sale.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/sell')}>Sell an Item</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {myItems.map(item => (
                                    <ItemCard key={item._id} item={item} onDelete={handleDeleteItem} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Settings size={24} style={{ color: 'var(--clr-brand-primary)' }} /> Account Settings
                        </h2>

                        <form style={{ maxWidth: '500px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" defaultValue={user?.name} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-input" defaultValue={user?.email} disabled />
                                <small style={{ color: 'var(--clr-text-tertiary)', marginTop: '0.25rem', display: 'block' }}>Email address cannot be changed</small>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '2rem 0' }} />

                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Change Password</h3>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input type="password" className="form-input" placeholder="Leave blank to keep same" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input type="password" className="form-input" />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
        .tab-btn:hover:not(.active) {
          background-color: var(--clr-bg-tertiary) !important;
        }
        @media(min-width: 768px) {
          .profile-layout {
            grid-template-columns: 280px 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default Profile;
