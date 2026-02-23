import React from 'react';
import { ShieldCheck, Leaf, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="animate-fade-in container" style={{ padding: '2rem 0' }}>

            {/* Hero section */}
            <section style={{ textAlign: 'center', marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem' }}>
                <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--clr-brand-primary), var(--clr-brand-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Reimagining Resale
                </h1>
                <p style={{ fontSize: '1.5rem', color: 'var(--clr-text-secondary)', lineHeight: 1.6 }}>
                    Reshell is building the most trusted destination for buying and selling premium second-hand goods.
                </p>
            </section>

            {/* Values section */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '5rem' }}>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)', marginBottom: '1.5rem' }}>
                        <Leaf size={48} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sustainable Future</h3>
                    <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.6 }}>Extending the lifecycle of products reduces waste and lowers our collective carbon footprint. Every item sold on Reshell is a win for the planet.</p>
                </div>

                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--clr-brand-primary)', marginBottom: '1.5rem' }}>
                        <ShieldCheck size={48} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Trusted Platform</h3>
                    <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.6 }}>We employ rigorous seller verification and secure payment options to ensure that every transaction is safe, transparent, and completely worry-free.</p>
                </div>

                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--clr-brand-accent)', marginBottom: '1.5rem' }}>
                        <Users size={48} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Community First</h3>
                    <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.6 }}>Reshell is more than a marketplace; it's a community of conscious consumers who value quality, authenticity, and human connection.</p>
                </div>
            </section>

        </div>
    );
};

export default About;
