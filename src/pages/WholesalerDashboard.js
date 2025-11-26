import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const WholesalerDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
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
      const q = query(productsRef, where('wholesalerId', '==', currentUser.uid));
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
      const ordersRef = collection(db, 'wholesalerOrders');
      const q = query(ordersRef, where('wholesalerId', '==', currentUser.uid));
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        wholesalerId: currentUser.uid,
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'wholesalerOrders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      fetchOrders();
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
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
    completedOrders: orders.filter(o => o.status === 'completed').length
  };

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <h1>🛒 Live MART - Wholesaler</h1>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <h2>Welcome, {userData?.name || 'Wholesaler'}! 🏭</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Manage your bulk inventory and retailer orders
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
            <div className="stat-label">Retailer Orders</div>
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

        {/* Add Product Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>My Products Catalog</h3>
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
                  <label>Wholesale Price (₹) *</label>
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
        <div style={{ marginBottom: '3rem' }}>
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

        {/* Retailer Orders */}
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Retailer Orders</h3>
          {orders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No orders from retailers yet.</p>
            </div>
          ) : (
            <div>
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4>{order.productName}</h4>
                      <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                        Quantity: {order.quantity} units
                      </p>
                      <p style={{ color: '#6b7280' }}>
                        Total: ₹{order.totalPrice}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Order Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`order-status ${order.status}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                        className="btn btn-primary"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                        className="btn btn-success"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                      className="btn btn-success"
                      style={{ marginTop: '1rem' }}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WholesalerDashboard;
