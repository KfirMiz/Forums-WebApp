import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/users/login', form);
      login(res.data.user, res.data.token);
      //alert('Logged in');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="card">
        <h2 className="page-title" style={{ marginTop: 0 }}>Login</h2>
        <p className="muted" style={{ marginTop: -6, marginBottom: 16 }}>
          Welcome back. Sign in to create forums and threads.
        </p>
        <form onSubmit={submit} className="form">
          <input
            className="input"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" className="btn">Login</button>
        </form>
      </div>
    </div>
  );
}
