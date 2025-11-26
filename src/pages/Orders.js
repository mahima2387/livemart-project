import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Orders = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchOrders();
  }, [currentUser, userRole]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      let q;
      
      if (userRole === 'customer') {
        q = query(ordersRef, where('customerId', '==', currentUser.uid));
      } else if (userRole === 'retailer') {
        q = query(ordersRef, where('retailerId', '==', currentUser.uid));
      }
      
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      fetchOrders();
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const handleSubmitFeedback = async (orderId) => {
    if (!feedback.comment) {
      alert('Please write a comment');
      return;
    }

    try {
      await addDoc(collection(db, 'feedback'), {
        orderId: orderId,
        customerId: currentUser.uid,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: new Date().toISOString()
      });
      
      setSelectedOrder(null);
      setFeedback({ rating: 5, comment: '' });
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#fbbf24',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
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
          <Link to="/dashboard">
            {userRole === 'customer' ? 'Home' : 'Dashboard'}
          </Link>
          {userRole === 'customer' && <Link to="/cart">Cart</Link>}
          <Link to="/orders">Orders</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2 style={{ marginBottom: '2rem' }}>
          {userRole === 'customer' ? 'My Orders' : 'Customer Orders'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No orders yet</p>
            {userRole === 'customer' && (
              <Link to="/dashboard" className="btn btn-primary">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div>
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h4>Order #{order.id.substring(0, 8)}</h4>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span 
                    className={`order-status ${order.status}`}
                    style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ marginBottom: '0.5rem' }}>Items:</h5>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span>{item.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 500 }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Delivery: {order.deliveryAddress}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <Link
                    to={`/order/${order.id}`}
                    className="btn btn-secondary"
                  >
                    Track Order
                  </Link>

                  {userRole === 'retailer' && order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'processing')}
                        className="btn btn-primary"
                      >
                        Accept Order
                      </button>
                    </>
                  )}

                  {userRole === 'retailer' && order.status === 'processing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      className="btn btn-primary"
                    >
                      Mark as Shipped
                    </button>
                  )}

                  {userRole === 'retailer' && order.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      className="btn btn-success"
                    >
                      Mark as Delivered
                    </button>
                  )}

                  {userRole === 'customer' && order.status === 'delivered' && (
                    <button
                      onClick={() => setSelectedOrder(order.id)}
                      className="btn btn-primary"
                    >
                      Give Feedback
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: '1.5rem' }}>Submit Feedback</h3>
              
              <div className="form-group">
                <label>Rating</label>
                <select
                  value={feedback.rating}
                  onChange={(e) => setFeedback({ ...feedback, rating: Number(e.target.value) })}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  rows="4"
                  placeholder="Share your experience..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSubmitFeedback(selectedOrder)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
