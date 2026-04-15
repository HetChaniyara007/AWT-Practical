import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <nav className="glass-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Store className="brand-icon" />
          <span>LuxeAura</span>
        </Link>
        <div className="nav-links">
          <Link to="/cart" className="cart-link">
            <ShoppingCart className="cart-icon" />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
