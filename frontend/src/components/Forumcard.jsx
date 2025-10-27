import React from 'react';
import { Link } from 'react-router-dom';

export default function ForumCard({ forum }) {
  return (
    <article className="forum-card">
      {forum.forumPic && (
        <img src={forum.forumPic} alt={forum.topic} className="forum-thumb" />
      )}
      <div className="forum-body">
        <h3><Link to={`/forums/${forum._id || forum.id}`}>{forum.topic}</Link></h3>
        <p className="muted">{forum.description}</p>
        <small className="muted">Created: {new Date(forum.creationTime).toLocaleString()}</small>
      </div>
    </article>
  );
}
