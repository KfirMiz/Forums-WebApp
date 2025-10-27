import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to ForumApp - WebApp for Forums</h1>
      <p>This project was made in a 24h period for educational purposes using MERN stack</p>
      <p><Link to="/forums">Browse Forums</Link></p>
    </div>
  );
}
