import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ItemCard from '../components/items/ItemCard';
import { Search } from 'lucide-react';

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const { data } = await axios.get('/api/items');
                setItems(data.items);
            } catch (err) {
                setError('Failed to load items. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    return (
        <div className="animate-fade-in">

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                padding: '4rem 2rem',
                marginBottom: '4rem',
                backgroundColor: 'var(--clr-brand-primary)',
                color: 'white',
                textAlign: 'center',
                background: 'linear-gradient(135deg, var(--clr-brand-primary) 0%, var(--clr-brand-accent) 100%)'
            }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.025em' }}>
                        Give items a second life.
                    </h1>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
                        Join the premier marketplace for high-quality, pre-loved goods. Buy, sell, and discover amazing finds.
                    </p>

                    <div style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: 'var(--radius-full)', padding: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', color: 'var(--clr-text-secondary)' }}>
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.75rem 1rem', fontSize: '1rem', outline: 'none', color: 'var(--clr-text-primary)' }}
                        />
                        <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}>Search</button>
                    </div>
                </div>

                {/* Abstract shapes for hero background */}
                <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)', zIndex: 0 }}></div>
            </section>

            {/* Featured Items Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Fresh Finds</h2>
                        <p style={{ color: 'var(--clr-text-secondary)', fontSize: '1.125rem' }}>The latest additions to our marketplace</p>
                    </div>
                    <button className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)', fontSize: '0.875rem' }}>View All</button>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass-panel" style={{ height: '350px', animation: 'pulse 2s infinite ease-in-out', backgroundColor: 'var(--clr-bg-tertiary)' }}></div>
                        ))}
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--clr-error)', borderRadius: 'var(--radius-lg)' }}>
                        {error}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {items.map(item => (
                            <ItemCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </section>

            <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
        </div>
    );
};

export default Home;
