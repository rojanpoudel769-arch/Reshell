import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, ShieldCheck, Mail, Heart, ChevronLeft } from 'lucide-react';
import ItemCard from '../components/items/ItemCard';

const ItemDetail = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        const fetchItemData = async () => {
            setLoading(true);
            try {
                const [itemRes, relatedRes] = await Promise.all([
                    axios.get(`/api/items/${id}`),
                    axios.get(`/api/items/${id}/related`)
                ]);
                setItem(itemRes.data);
                setRelatedItems(relatedRes.data);
            } catch (err) {
                setError('Item not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchItemData();
    }, [id]);

    const handleDeleteItem = async (itemId) => {
        try {
            await axios.delete(`/api/items/${itemId}`);
            setRelatedItems(prev => prev.filter(item => item._id !== itemId));
            if (item?._id === itemId) {
                setItem(null);
                setError('Item has been deleted.');
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            alert(err.response?.data?.message || 'Failed to delete item');
        }
    };

    if (loading) {
        return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading details...</div>;
    }

    if (error || !item) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--clr-error)' }}>{error}</h2>
                <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Return Home</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--clr-text-secondary)', fontWeight: 500 }}>
                    <ChevronLeft size={20} /> Back to Search
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }} className="detail-grid">

                {/* Images Column */}
                <div>
                    <div className="glass-panel" style={{ overflow: 'hidden', padding: 0, backgroundColor: 'var(--clr-bg-tertiary)' }}>
                        <img
                            src={item.images[0] || 'https://via.placeholder.com/800x600?text=No+Image'}
                            alt={item.title}
                            style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
                        />
                    </div>
                    {item.images.length > 1 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                            {item.images.map((img, idx) => (
                                <div key={idx} className="glass-panel" style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
                                    <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--clr-brand-primary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600 }}>
                                {item.category}
                            </span>
                            {item.condition && (
                                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600 }}>
                                    {item.condition}
                                </span>
                            )}
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                            <Heart size={20} />
                        </button>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.title}</h1>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--clr-brand-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        Rs. {item.price.toLocaleString()}
                        {item.negotiable && <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--clr-text-secondary)', backgroundColor: 'var(--clr-bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>Negotiable</span>}
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: 'var(--clr-bg-secondary)' }}>
                        <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.125rem', whiteSpace: 'pre-line' }}>
                            {item.description}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ backgroundColor: 'var(--clr-bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--clr-text-secondary)' }}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</div>
                                <div style={{ fontWeight: 600 }}>{item.location}</div>
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ backgroundColor: 'var(--clr-bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--clr-text-secondary)' }}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listed</div>
                                <div style={{ fontWeight: 600 }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Section */}
                    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: 'auto', border: '2px solid var(--clr-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Seller Information</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-success)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    <ShieldCheck size={16} /> Verified Member
                                </div>
                            </div>
                            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'var(--clr-brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                                {item.seller?.name ? item.seller.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>

                        <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '1rem' }}>{item.seller?.name}</p>

                        {user ? (
                            <button className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                                <Mail size={20} /> Contact Seller
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                                Log in to contact seller
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Items Section */}
            {relatedItems.length > 0 && (
                <section style={{ marginTop: '5rem', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>You May Also Like</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                        {relatedItems.map(relItem => (
                            <ItemCard key={relItem._id} item={relItem} onDelete={handleDeleteItem} showActions={false} />
                        ))}
                    </div>
                </section>
            )}

            <style>{`
        @media(min-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default ItemDetail;
