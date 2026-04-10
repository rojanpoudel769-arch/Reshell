import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import ItemCard from '../components/items/ItemCard';
import { Filter, Search } from 'lucide-react';

const categories = [
    'All', 'Electronics', 'Clothing', 'Home', 'Books', 'Toys', 'Sports', 'Other'
];

const Explore = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters (initialized from URL)
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const [showFilters, setShowFilters] = useState(false);

    // Sync state with URL whenever location.search changes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setKeyword(params.get('keyword') || '');
        setCategory(params.get('category') || 'All');
        setMinPrice(params.get('minPrice') || '');
        setMaxPrice(params.get('maxPrice') || '');
    }, [location.search]);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(location.search);
                const currentKeyword = params.get('keyword') || '';
                const currentCategory = params.get('category') || 'All';
                const currentMin = params.get('minPrice') || '';
                const currentMax = params.get('maxPrice') || '';

                let url = `/api/items?`;
                if (currentKeyword) url += `keyword=${currentKeyword}&`;
                if (currentCategory !== 'All') url += `category=${currentCategory}&`;
                if (currentMin) url += `minPrice=${currentMin}&`;
                if (currentMax) url += `maxPrice=${currentMax}&`;

                const { data } = await axios.get(url);
                setItems(data.items);

                // Smart Category Detection:
                // If we are in "All" and have results, check if they all belong to one category
                if (currentCategory === 'All' && data.items.length > 0 && currentKeyword) {
                    const uniqueCategories = [...new Set(data.items.map(item => item.category))];
                    if (uniqueCategories.length === 1) {
                        setCategory(uniqueCategories[0]);
                    }
                }

                // Redirect to not-found if no items found and a keyword was used
                if (data.items.length === 0 && currentKeyword && !loading) {
                    navigate('/not-found');
                }
            } catch (err) {
                setError('Failed to fetch items');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [location.search]);

    const handleDeleteItem = async (itemId) => {
        try {
            await axios.delete(`/api/items/${itemId}`);
            setItems(prev => prev.filter(item => item._id !== itemId));
        } catch (err) {
            console.error('Error deleting item:', err);
            alert(err.response?.data?.message || 'Failed to delete item');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        let query = `?`;
        if (keyword) query += `keyword=${keyword}&`;
        if (category !== 'All') query += `category=${category}&`;
        if (minPrice) query += `minPrice=${minPrice}&`;
        if (maxPrice) query += `maxPrice=${maxPrice}&`;

        navigate(`/explore${query}`);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ margin: 0 }}>Explore Items</h1>

                <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, maxWidth: '600px', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            className="form-input"
                            style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-tertiary)' }} />
                    </div>
                    <button type="submit" className="btn btn-primary">Search</button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={20} />
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }} className="explore-layout">

                {/* Filters Sidebar */}
                <div style={{ width: '100%', maxWidth: showFilters ? '300px' : '0', overflow: 'hidden', opacity: showFilters ? 1 : 0, transition: 'all var(--transition-normal)' }} className="filters-sidebar">
                    <div className="glass-panel" style={{ padding: '1.5rem', width: '300px' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={18} /> Filters
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {categories.map(cat => (
                                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat}
                                            checked={category === cat}
                                            onChange={(e) => setCategory(e.target.value)}
                                            style={{ accentColor: 'var(--clr-brand-primary)' }}
                                        />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '2rem' }}>
                            <label className="form-label">Price Range</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSearch}>
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Results Grid */}
                <div style={{ flex: 1 }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="glass-panel" style={{ height: '350px', animation: 'pulse 2s infinite ease-in-out', backgroundColor: 'var(--clr-bg-tertiary)' }}></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div style={{ padding: '2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--clr-error)', borderRadius: 'var(--radius-lg)' }}>
                            {error}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <Search size={48} style={{ color: 'var(--clr-text-tertiary)', marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>No items found</h3>
                            <p style={{ color: 'var(--clr-text-secondary)' }}>Try adjusting your filters or search keywords.</p>
                            <button
                                className="btn btn-secondary"
                                style={{ marginTop: '1.5rem' }}
                                onClick={() => {
                                    setKeyword(''); setCategory('All'); setMinPrice(''); setMaxPrice('');
                                    navigate('/explore');
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            {items.map(item => (
                                <ItemCard key={item._id} item={item} onDelete={handleDeleteItem} showActions={false} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        @media(min-width: 1024px) {
          .filters-sidebar {
            max-width: 300px !important;
            opacity: 1 !important;
          }
        }
      `}</style>
        </div>
    );
};

export default Explore;
