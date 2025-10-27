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
      <div className="nav-left">
        <Link to="/" className="brand">ForumApp</Link>
        <Link to="/forums">Forums</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/profile">{user.username}</Link>
            <button onClick={onLogout} className="btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
