import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <h1>🛒 Live MART</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <h1>Welcome to Live MART</h1>
          <p>Your Complete Online Delivery Solution</p>
          <p>Connecting Customers, Retailers, and Wholesalers</p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>
            Why Choose Live MART?
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '3rem' }}>
            A comprehensive platform designed for seamless online commerce
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Multi-Role Platform</h3>
              <p>Separate dashboards for Customers, Retailers, and Wholesalers with role-specific features</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Advanced filtering by price, quantity, location, and stock availability</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Location-Based</h3>
              <p>Find nearby shops and region-specific local products</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Order Tracking</h3>
              <p>Real-time order status updates and delivery tracking</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Flexible Payment</h3>
              <p>Support for both online and offline payment options</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Feedback System</h3>
              <p>Product reviews and ratings to help you make informed decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section style={{ padding: '4rem 2rem', background: '#f9fafb' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>
            Choose Your Role
          </h2>

          <div className="feature-grid">
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
              <h3>Customer</h3>
              <p style={{ color: '#6b7280', margin: '1rem 0' }}>
                Browse products, place orders, track deliveries, and provide feedback
              </p>
              <Link to="/signup" className="btn btn-primary">Sign Up as Customer</Link>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
              <h3>Retailer</h3>
              <p style={{ color: '#6b7280', margin: '1rem 0' }}>
                Manage inventory, track sales, order from wholesalers, and serve customers
              </p>
              <Link to="/signup" className="btn btn-primary">Sign Up as Retailer</Link>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏭</div>
              <h3>Wholesaler</h3>
              <p style={{ color: '#6b7280', margin: '1rem 0' }}>
                Supply products to retailers, manage bulk orders, and track transactions
              </p>
              <Link to="/signup" className="btn btn-primary">Sign Up as Wholesaler</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <p>&copy; 2025 Live MART. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', color: '#9ca3af' }}>
          OOP Project - Semester I, 2025-2026
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
