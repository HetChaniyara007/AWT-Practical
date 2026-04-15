import React from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <div className="page-container fade-in flex-center">
        <div className="glass-panel empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">Your Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item glass-panel">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item._id, item.qty - 1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQuantity(item._id, item.qty + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  className="btn-icon delete-btn" 
                  onClick={() => removeFromCart(item._id)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary glass-panel">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <button className="btn-primary w-full mt-4 checkout-btn">
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
