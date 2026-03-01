import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav('/');
  };

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="nav-left">
          <Link to="/" className="brand">ForumApp</Link>
          <Link to="/forums" className="pill">Browse</Link>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <Link to="/profile" className="pill">{user.username}</Link>
              <button onClick={onLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="pill">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
