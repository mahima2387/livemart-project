import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProductDetails = () => {
  const { id } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProduct();
    fetchFeedback();
    loadCart();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'products', id));
      if (productDoc.exists()) {
        setProduct({ id: productDoc.id, ...productDoc.data() });
      } else {
        alert('Product not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const feedbackRef = collection(db, 'feedback');
      const q = query(feedbackRef, where('productId', '==', id));
      const querySnapshot = await getDocs(q);
      
      const feedbackData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem(`cart_${currentUser.uid}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem(`cart_${currentUser.uid}`, JSON.stringify(newCart));
    alert('Product added to cart!');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const calculateAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => acc + item.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h1>🛒 Live MART</h1>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/dashboard">Home</Link>
            <Link to="/cart">Cart ({cart.length})</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <h1>🛒 Live MART</h1>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/dashboard">Home</Link>
          <Link to="/cart">Cart ({cart.length})</Link>
          <Link to="/orders">My Orders</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <Link to="/dashboard" style={{ color: '#2563eb', marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Products
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
          {/* Product Image */}
          <div>
            <div style={{
              width: '100%',
              height: '400px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '6rem'
            }}>
              {getCategoryIcon(product.category)}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', color: '#2563eb', fontWeight: 'bold' }}>
                ₹{product.price}
              </span>
              {feedback.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#fbbf24', fontSize: '1.5rem' }}>★</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                    {calculateAverageRating()}
                  </span>
                  <span style={{ color: '#6b7280' }}>({feedback.length} reviews)</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: product.stock > 0 ? '#d1fae5' : '#fee2e2',
                color: product.stock > 0 ? '#065f46' : '#991b1b',
                borderRadius: '0.375rem',
                fontWeight: 500
              }}>
                {product.stock > 0 ? `In Stock: ${product.stock} available` : 'Out of Stock'}
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>Category:</strong> {product.category}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => addToCart(product)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <Link
                to="/cart"
                className="btn btn-secondary"
                style={{ padding: '1rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}
              >
                Go to Cart
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Customer Reviews</h2>
          
          {feedback.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div>
              {feedback.map(review => (
                <div key={review.id} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: i < review.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.25rem' }}>
                        ★
                      </span>
                    ))}
                    <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: '#374151' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    'Electronics': '📱',
    'Groceries': '🛒',
    'Clothing': '👕',
    'Home & Kitchen': '🏠',
    'Books': '📚',
    'Sports': '⚽',
  };
  return icons[category] || '📦';
};

export default ProductDetails;
