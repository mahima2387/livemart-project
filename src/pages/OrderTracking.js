import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        setOrder({ id: orderDoc.id, ...orderDoc.data() });
      } else {
        alert('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
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

  const getTrackingSteps = () => {
    return [
      { status: 'pending', label: 'Order Placed', icon: '📝' },
      { status: 'processing', label: 'Processing', icon: '⚙️' },
      { status: 'shipped', label: 'Shipped', icon: '🚚' },
      { status: 'delivered', label: 'Delivered', icon: '✅' }
    ];
  };

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    return statuses.indexOf(status);
  };

  const isStepCompleted = (step) => {
    if (!order) return false;
    if (order.status === 'cancelled') return false;
    
    const currentIndex = getStatusIndex(order.status);
    const stepIndex = getStatusIndex(step.status);
    return stepIndex <= currentIndex;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h1>🛒 Live MART</h1>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/dashboard">Home</Link>
            <Link to="/orders">Orders</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <h1>🛒 Live MART</h1>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/dashboard">Home</Link>
          <Link to="/orders">Orders</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <Link to="/orders" style={{ color: '#2563eb', marginBottom: '2rem', display: 'inline-block' }}>
          ← Back to Orders
        </Link>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
            <div>
              <h2>Order #{order.id.substring(0, 8)}</h2>
              <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
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
              style={{ 
                padding: '0.75rem 1.5rem',
                fontSize: '1rem'
              }}
            >
              {order.status.toUpperCase()}
            </span>
          </div>

          {/* Tracking Timeline */}
          {order.status !== 'cancelled' && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ marginBottom: '2rem' }}>Order Tracking</h3>
              <div style={{ position: 'relative' }}>
                {getTrackingSteps().map((step, index) => (
                  <div key={step.status} style={{ display: 'flex', alignItems: 'start', marginBottom: '2rem' }}>
                    {/* Icon */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: isStepCompleted(step) ? '#10b981' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                      zIndex: 1
                    }}>
                      {step.icon}
                    </div>
                    
                    {/* Connector Line */}
                    {index < getTrackingSteps().length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '29px',
                        top: '60px',
                        width: '2px',
                        height: '60px',
                        background: isStepCompleted(getTrackingSteps()[index + 1]) ? '#10b981' : '#e5e7eb'
                      }} />
                    )}
                    
                    {/* Label */}
                    <div style={{ marginLeft: '1.5rem', paddingTop: '1rem' }}>
                      <h4 style={{ 
                        color: isStepCompleted(step) ? '#111827' : '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        {step.label}
                      </h4>
                      {isStepCompleted(step) && order.status === step.status && (
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          Current status
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div style={{ 
              padding: '2rem', 
              background: '#fee2e2', 
              borderRadius: '0.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Order Cancelled</h3>
              <p style={{ color: '#7f1d1d' }}>This order has been cancelled.</p>
            </div>
          )}

          {/* Order Items */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Order Items</h3>
            {order.items.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.375rem',
                  marginBottom: '0.5rem'
                }}
              >
                <div>
                  <h4>{item.name}</h4>
                  <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    ₹{item.price} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Delivery Address</h4>
              <p style={{ color: '#6b7280' }}>{order.deliveryAddress}</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Payment Method</h4>
              <p style={{ color: '#6b7280' }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
              {order.estimatedDelivery && (
                <>
                  <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Estimated Delivery</h4>
                  <p style={{ color: '#6b7280' }}>
                    {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Order Total */}
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '2rem', 
            borderTop: '2px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3>Total Amount</h3>
            <h2 style={{ color: '#2563eb' }}>₹{order.totalAmount}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
