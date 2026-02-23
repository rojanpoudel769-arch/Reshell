import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Shirt, Home as HomeIcon, BookOpen, Gamepad2, Dumbbell, Package } from 'lucide-react';

const categoryData = [
    { name: 'Electronics', icon: <Laptop size={32} />, color: '#3b82f6', count: 124 },
    { name: 'Clothing', icon: <Shirt size={32} />, color: '#ec4899', count: 342 },
    { name: 'Home', icon: <HomeIcon size={32} />, color: '#f59e0b', count: 89 },
    { name: 'Books', icon: <BookOpen size={32} />, color: '#10b981', count: 215 },
    { name: 'Toys', icon: <Gamepad2 size={32} />, color: '#8b5cf6', count: 67 },
    { name: 'Sports', icon: <Dumbbell size={32} />, color: '#ef4444', count: 45 },
    { name: 'Other', icon: <Package size={32} />, color: '#64748b', count: 112 },
];

const Categories = () => {
    return (
        <div className="animate-fade-in container" style={{ padding: '2rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Browse by Category</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--clr-text-secondary)' }}>Find exactly what you're looking for across our curated selection.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                {categoryData.map((cat, idx) => (
                    <Link
                        key={idx}
                        to={`/explore?category=${cat.name}`}
                        className="glass-panel"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            textDecoration: 'none',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        <div style={{
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '50%',
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            {cat.icon}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--clr-text-primary)' }}>{cat.name}</h2>
                        <p style={{ color: 'var(--clr-text-tertiary)', fontWeight: 500 }}>{cat.count} items</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
