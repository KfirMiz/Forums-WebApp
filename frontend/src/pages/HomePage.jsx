import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container">
      <div className="card" style={{ padding: 22 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>
          ForumApp
        </h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16, maxWidth: 720 }}>
          A lightweight forums webapp built with the MERN stack. Create forums, post threads, and manage your profile.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/forums" className="btn">Browse forums</Link>
          <Link to="/register" className="btn btn-secondary">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
