import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const RetailerDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wholesalerProducts, setWholesalerProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics'
  });

  const categories = ['Electronics', 'Groceries', 'Clothing', 'Home & Kitchen', 'Books', 'Sports'];

  useEffect(() => {
    fetchUserData();
    fetchMyProducts();
    fetchOrders();
    fetchWholesalerProducts();
  }, [currentUser]);

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

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('retailerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('retailerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWholesalerProducts = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'wholesaler'));
      const querySnapshot = await getDocs(q);
      
      const wholesalerIds = querySnapshot.docs.map(doc => doc.id);
      
      const productsRef = collection(db, 'products');
      const allProducts = [];
      
      for (const wholesalerId of wholesalerIds) {
        const productQuery = query(productsRef, where('wholesalerId', '==', wholesalerId));
        const productSnapshot = await getDocs(productQuery);
        productSnapshot.docs.forEach(doc => {
          allProducts.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }
      
      setWholesalerProducts(allProducts);
    } catch (error) {
      console.error('Error fetching wholesaler products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        retailerId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'Electronics'
      });
      
      setShowAddProduct(false);
      fetchMyProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchMyProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleOrderFromWholesaler = async (product) => {
    const quantity = prompt('Enter quantity to order:');
    if (quantity && Number(quantity) > 0) {
      try {
        await addDoc(collection(db, 'wholesalerOrders'), {
          productId: product.id,
          productName: product.name,
          quantity: Number(quantity),
          wholesalerId: product.wholesalerId,
          retailerId: currentUser.uid,
          status: 'pending',
          totalPrice: product.price * Number(quantity),
          createdAt: new Date().toISOString()
        });
        
        alert('Order placed successfully!');
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <h1>🛒 Live MART - Retailer</h1>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/orders">Orders</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <h2>Welcome, {userData?.name || 'Retailer'}! 🏪</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Manage your inventory and orders
          </p>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedOrders}</div>
            <div className="stat-label">Completed Orders</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'inventory' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'inventory' ? '#2563eb' : '#6b7280',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            My Inventory
          </button>
          <button
            onClick={() => setActiveTab('wholesaler')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'wholesaler' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'wholesaler' ? '#2563eb' : '#6b7280',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Order from Wholesaler
          </button>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>My Products</h3>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="btn btn-primary"
              >
                {showAddProduct ? 'Cancel' : '+ Add Product'}
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Add New Product</h4>
                <form onSubmit={handleAddProduct}>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows="3"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity *</label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">Add Product</button>
                </form>
              </div>
            )}

            {/* Products List */}
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="card-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {product.description}
                      </p>
                      <p className="product-price">₹{product.price}</p>
                      <p className="product-stock">Stock: {product.stock}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Category: {product.category}
                      </p>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn-danger"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wholesaler Products Tab */}
        {activeTab === 'wholesaler' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Available Products from Wholesalers</h3>
            {wholesalerProducts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No products available from wholesalers at the moment.</p>
              </div>
            ) : (
              <div className="card-grid">
                {wholesalerProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {product.description}
                      </p>
                      <p className="product-price">₹{product.price}</p>
                      <p className="product-stock">Available: {product.stock}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Category: {product.category}
                      </p>
                      <button
                        onClick={() => handleOrderFromWholesaler(product)}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      >
                        Order from Wholesaler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerDashboard;
