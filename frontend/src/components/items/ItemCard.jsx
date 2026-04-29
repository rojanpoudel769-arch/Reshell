import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ItemCard = ({ item, onDelete, showActions = true }) => {
    const { user, toggleSave } = useAuth();
    const navigate = useNavigate();

    const isSaved = user?.savedItems?.some(savedItem => {
        if (!savedItem) return false;
        const id = savedItem._id || savedItem;
        return id.toString() === item._id.toString();
    });

    const isOwner = user && (user._id === (item.seller?._id || item.seller)) && showActions;

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        await toggleSave(item);
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this item?')) {
            onDelete(item._id);
        }
    };

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/edit-item/${item._id}`);
    };

    return (
        <div
            className="item-card glass-panel"
            style={{ overflow: 'hidden', padding: 0, transition: 'var(--transition-normal)', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--clr-border)', cursor: 'pointer' }}
            onClick={() => navigate(`/items/${item._id}`)}
        >

            {/* Image Section */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '75%', backgroundColor: 'var(--clr-bg-tertiary)', overflow: 'hidden' }}>
                <img
                    src={item.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={item.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="item-image"
                />
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    {isOwner && (
                        <>
                            <button
                                className="edit-btn"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-primary)', backdropFilter: 'blur(4px)', transition: 'all 0.2s', zIndex: 2, border: 'none' }}
                                onClick={handleEdit}
                                title="Edit Item"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                className="delete-btn"
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(4px)', transition: 'all 0.2s', zIndex: 2, border: 'none' }}
                                onClick={handleDelete}
                                title="Delete Item"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    )}
                    <button
                        className="favorite-btn"
                        style={{
                            backgroundColor: isSaved ? 'var(--clr-brand-primary)' : 'rgba(255,255,255,0.8)',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSaved ? 'white' : 'var(--clr-text-secondary)',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.2s',
                            zIndex: 2,
                            border: 'none'
                        }}
                        onClick={handleToggleSave}
                    >
                        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
                <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                    {item.category}
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: 'var(--clr-text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <Link to={`/items/${item._id}`} style={{ color: 'inherit' }}>{item.title}</Link>
                    </h3>
                </div>

                <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--clr-brand-primary)' }}>
                            Rs. {item.price.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-text-tertiary)', fontSize: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={12} />
                                {item.location}
                            </span>
                            <span>•</span>
                            <span>Seller: <strong>{item.seller?.name || 'Unknown User'}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .item-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--clr-brand-primary);
        }
        .item-card:hover .item-image {
          transform: scale(1.05);
        }
        .favorite-btn:hover {
          color: var(--clr-brand-accent) !important;
          transform: scale(1.1);
        }
        .delete-btn:hover {
          background-color: var(--clr-error) !important;
          transform: scale(1.1);
        }
        .edit-btn:hover {
          background-color: var(--clr-brand-primary) !important;
          color: white !important;
          transform: scale(1.1);
        }
      `}</style>
        </div>
    );
};

export default ItemCard;
