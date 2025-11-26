import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const CustomerDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [cart, setCart] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Electronics', 'Groceries', 'Clothing', 'Home & Kitchen', 'Books', 'Sports'];

  useEffect(() => {
    fetchUserData();
    fetchProducts();
    loadCart();
  }, [currentUser]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, priceRange, products]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('stock', '>', 0));
      const querySnapshot = await getDocs(q);
      
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    setFilteredProducts(filtered);
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

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <h1>🛒 Live MART</h1>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/dashboard">Home</Link>
          <Link to="/cart">
            🛒 Cart ({cart.length})
          </Link>
          <Link to="/orders">My Orders</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <h2>Welcome, {userData?.name || 'Customer'}! 👋</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Browse products and place your orders
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search and Filters */}
        <div className="filter-section">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label>Price Range:</label>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              style={{ width: '100px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              style={{ width: '100px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div 
                  className="product-image"
                  style={{ 
                    background: `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem'
                  }}
                >
                  {getCategoryIcon(product.category)}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    {product.description || 'No description available'}
                  </p>
                  <p className="product-price">₹{product.price}</p>
                  <p className="product-stock">
                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Category: {product.category}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.625rem 1rem', textDecoration: 'none', display: 'inline-block' }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
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

const getRandomColor = () => {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default CustomerDashboard;
