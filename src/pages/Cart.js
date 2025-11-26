import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

const Cart = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, [currentUser]);

  const loadCart = () => {
    const savedCart = localStorage.getItem(`cart_${currentUser.uid}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem(`cart_${currentUser.uid}`, JSON.stringify(newCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(newCart);
  };

  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    updateCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!deliveryAddress) {
      alert('Please enter delivery address!');
      return;
    }

    try {
      setLoading(true);

      // Create order for each retailer
      const ordersByRetailer = {};
      cart.forEach(item => {
        if (!ordersByRetailer[item.retailerId]) {
          ordersByRetailer[item.retailerId] = [];
        }
        ordersByRetailer[item.retailerId].push(item);
      });

      // Place orders
      for (const [retailerId, items] of Object.entries(ordersByRetailer)) {
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const orderData = {
          customerId: currentUser.uid,
          retailerId: retailerId,
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: orderTotal,
          deliveryAddress: deliveryAddress,
          paymentMethod: paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
        };

        await addDoc(collection(db, 'orders'), orderData);

        // Update product stock
        for (const item of items) {
          const productRef = doc(db, 'products', item.id);
          await updateDoc(productRef, {
            stock: increment(-item.quantity)
          });
        }
      }

      // Clear cart
      localStorage.removeItem(`cart_${currentUser.uid}`);
      setCart([]);
      
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
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
        <h2 style={{ marginBottom: '2rem' }}>Shopping Cart</h2>

        {cart.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your cart is empty</p>
            <Link to="/dashboard" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Cart Items */}
            <div>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>
                      📦
                    </div>
                  </div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                      Category: {item.category}
                    </p>
                    <p style={{ color: '#2563eb', fontWeight: 'bold', marginTop: '0.5rem' }}>
                      ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        background: 'white',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 0.5rem', minWidth: '2rem', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        background: 'white',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="btn btn-danger"
                      style={{ marginLeft: '1rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
                
                <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Items ({cart.length})</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Delivery</span>
                    <span style={{ color: '#10b981' }}>Free</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <span>Total</span>
                  <span style={{ color: '#2563eb' }}>₹{calculateTotal()}</span>
                </div>

                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="online">Online Payment</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
