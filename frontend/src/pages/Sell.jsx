import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, MapPin, Tag, AlignLeft, Info } from 'lucide-react';

const categories = [
    'Electronics', 'Clothing', 'Home', 'Books', 'Toys', 'Sports', 'Other'
];
const conditions = ['New', 'Like New', 'Used'];

const Sell = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        negotiable: false,
        condition: 'Used',
        category: 'Electronics',
        location: '',
        description: ''
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (images.length === 0) {
            setError('Please add at least one image.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                images
            };

            const { data } = await axios.post('/api/items', payload);
            navigate(`/items/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to list item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in container" style={{ padding: '2rem 0', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Sell an Item</h1>
            <p style={{ color: 'var(--clr-text-secondary)', textAlign: 'center', marginBottom: '3rem' }}>
                List your item in minutes and reach thousands of buyers.
            </p>

            {error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--clr-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>

                {/* Images Section */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Camera size={20} className="text-brand" /> Product Images
                    </h3>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {images.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer', border: 'none' }}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}

                        <label style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--clr-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--clr-text-tertiary)', backgroundColor: 'var(--clr-bg-tertiary)', transition: 'all 0.2s' }} className="image-upload-label">
                            <Camera size={24} style={{ marginBottom: '0.5rem' }} />
                            <span style={{ fontSize: '0.75rem' }}>Add Photo</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <small style={{ color: 'var(--clr-text-tertiary)' }}>Main photo will be the first one. You can upload multiple.</small>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '2rem 0' }} />

                {/* Product Information */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Info size={20} className="text-brand" /> Product Information
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Product Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="e.g. iPhone 13 Pro Max - 128GB"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            maxLength="100"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" className="form-input" value={formData.category} onChange={handleInputChange} required>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Condition</label>
                            <select name="condition" className="form-input" value={formData.condition} onChange={handleInputChange} required>
                                {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '2rem 0' }} />

                {/* Price & Location */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Tag size={20} className="text-brand" /> Pricing & Location
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                        <div className="form-group">
                            <label className="form-label">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                className="form-input"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>
                                <input
                                    type="checkbox"
                                    name="negotiable"
                                    checked={formData.negotiable}
                                    onChange={handleInputChange}
                                    style={{ accentColor: 'var(--clr-brand-primary)' }}
                                />
                                Price is negotiable
                            </label>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={16} /> Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                className="form-input"
                                placeholder="City / District"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '2rem 0' }} />

                {/* Description */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <AlignLeft size={20} className="text-brand" /> Description
                    </h3>

                    <div className="form-group">
                        <textarea
                            name="description"
                            className="form-input"
                            placeholder="Describe the item, including any flaws, exact specifications, and why you are selling it."
                            rows="6"
                            style={{ resize: 'vertical' }}
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            maxLength="1000"
                        ></textarea>
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--clr-text-tertiary)', marginTop: '0.25rem' }}>
                            {formData.description.length} / 1000
                        </div>
                    </div>
                </section>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
                    disabled={loading}
                >
                    {loading ? 'Posting...' : 'Post Listing'}
                </button>

            </form>

            <style>{`
        .image-upload-label:hover {
          border-color: var(--clr-brand-primary) !important;
          color: var(--clr-brand-primary) !important;
        }
        .text-brand {
          color: var(--clr-brand-primary);
        }
      `}</style>
        </div>
    );
};

export default Sell;
