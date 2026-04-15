import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">Discover the Extraordinary</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card glass-panel">
            <div className="product-image-container">
              <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
              <div className="category-badge">{product.category}</div>
            </div>
            <div className="product-info">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                <button 
                  className="btn-primary"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingBag size={18} /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
