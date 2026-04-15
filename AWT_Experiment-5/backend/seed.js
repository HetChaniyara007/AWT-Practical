const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and a 30-hour battery life.',
    price: 24999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
    stock: 15
  },
  {
    name: 'Minimalist Mechanical Keyboard',
    description: 'A sleek, tenkeyless mechanical keyboard featuring tactile brown switches and RGB backlighting.',
    price: 10499,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    category: 'Electronics',
    stock: 20
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'An adjustable ergonomic office chair with breathable mesh back and lumbar support.',
    price: 15999,
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80',
    category: 'Furniture',
    stock: 10
  },
  {
    name: 'Ceramic Coffee Mug',
    description: 'A beautifully crafted, hand-glazed ceramic coffee mug that holds up to 12oz.',
    price: 1999,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
    category: 'Home & Kitchen',
    stock: 50
  },
  {
    name: 'Smart Home Hub',
    description: 'Control all your smart home devices from a single, beautifully designed touchscreen hub.',
    price: 11999,
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80',
    category: 'Electronics',
    stock: 8
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    category: 'Fitness',
    stock: 30
  }
];

mongoose.connect('mongodb://localhost:27017/shopping_cart_db')
.then(async () => {
  console.log('MongoDB connected for seeding...');
  await Product.deleteMany(); // Clear existing products
  console.log('Old products cleared.');
  
  await Product.insertMany(products);
  console.log('Dummy products seeded successfully!');
  
  process.exit();
})
.catch(err => {
  console.error('Error with database seeding', err);
  process.exit(1);
});
