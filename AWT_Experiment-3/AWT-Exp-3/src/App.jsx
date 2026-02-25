import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication API call with 2-second delay
    setTimeout(() => {
      const mockUser = {
        name: 'Het Chaniyara',
        email: 'het@example.com',
        bio: 'Advanced Web Technologies Student | Full Stack Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Het'
      };

      setUser(mockUser);
      setIsLoading(false);
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoading(true);
    // Simulate slight delay for logout
    setTimeout(() => {
      setUser(null);
      setIsLoading(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="center-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header>
        <h1>Experiment 3: Auth & State</h1>
        <p className="subtitle">User Profile with Loading Patterns</p>
      </header>

      <main>
        {!user ? (
          <div className="auth-card">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your profile</p>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  defaultValue="het@example.com"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password"
                  defaultValue="password123"
                  required
                />
              </div>
              <button type="submit" className="primary-btn">Login</button>
            </form>
          </div>
        ) : (
          <div className="profile-card">
            <div className="profile-header">
              <img src={user.avatar} alt="User Avatar" className="avatar" />
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="profile-body">
              <h4>Profile Bio</h4>
              <p>{user.bio}</p>
            </div>
            <div className="profile-footer">
              <button onClick={handleLogout} className="outline-btn">Logout</button>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>AWT Practical - Experiment 3</p>
      </footer>
    </div>
  )
}

export default App
