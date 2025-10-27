import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function ForumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [threads, setThreads] = useState([]);
  const [form, setForm] = useState({ description: '' });
  const [editStates, setEditStates] = useState({});
  const [editTexts, setEditTexts] = useState({});
  const [editForum, setEditForum] = useState({ topic: '', description: '', forumPic: '' });
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      const f = await API.get(`/forums/${id}`);
      setForum(f.data);
      setEditForum({
        topic: f.data.topic,
        description: f.data.description,
        forumPic: f.data.forumPic || ''
      });
      const allThreads = await API.get('/threads');
      setThreads(
        allThreads.data.filter(
          (t) =>
            t.forumId === id ||
            t.forumId?._id === id ||
            t.forumId === (forum?._id || forum?.id)
        )
      );
    } catch (err) {
      alert('Failed to load forum');
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submitThread = async (e) => {
    e.preventDefault();
    try {
      await API.post('/threads', { forumId: id, description: form.description });
      setForm({ description: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create thread');
    }
  };

  const handleDeleteClick = (threadId) => {
    setEditStates((prev) => ({
      ...prev,
      [threadId]: prev[threadId]?.deleteConfirm ? {} : { ...prev[threadId], deleteConfirm: true },
    }));
  };

  const confirmDelete = async (threadId) => {
    try {
      await API.delete(`/threads/${threadId}`);
      setEditStates((prev) => ({ ...prev, [threadId]: {} }));
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete thread');
    }
  };

  const handleEditClick = (threadId) => {
    setEditStates((prev) => ({
      ...prev,
      [threadId]: { ...prev[threadId], editing: true },
    }));
    setEditTexts((prev) => ({ ...prev, [threadId]: '' }));
  };

  const handleUpdateThread = async (thread) => {
    const addition = editTexts[thread._id] || '';
    if (!addition) return alert('Enter text to update');
    try {
      await API.put(`/threads/${thread._id}`, {
        description: thread.description + '\n\nEDIT: ' + addition,
      });
      setEditStates((prev) => ({ ...prev, [thread._id]: {} }));
      setEditTexts((prev) => ({ ...prev, [thread._id]: '' }));
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update thread');
    }
  };

  // Forum editing permissions
  const isAdmin = user?.role === 'admin';
  const isOwner = user && forum && (forum.creatorUserId === user.id || forum.creatorUserId === user._id);
  const canEditForum = isAdmin || isOwner;

  const handleForumUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/forums/${id}`, editForum);
      alert('Forum updated!');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update forum');
    }
  };

  const handleForumDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this forum?')) return;
    try {
      await API.delete(`/forums/${id}`);
      alert('Forum deleted.');
      navigate('/forums');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete forum');
    }
  };

  // Forum picture upload
  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForum((prev) => ({ ...prev, forumPic: url }));
    } catch {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleBrowse = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left Sidebar: Forum Info */}
        {forum && (
          <div
            style={{
              flex: '0 0 300px',
              minWidth: 250,
              backgroundColor: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '1rem',
              marginBottom: '1rem',
              position: 'sticky',
              top: 20,
              alignSelf: 'flex-start',
            }}
          >
            <h2 style={{ textAlign: 'left', marginBottom: '0.5rem' }}>{forum.topic}</h2>
            {forum.forumPic && (
              <img
                src={forum.forumPic}
                alt={forum.topic}
                style={{ maxWidth: '100%', borderRadius: 8, marginBottom: '1rem' }}
              />
            )}
            <p style={{ marginBottom: '0.5rem' }}>{forum.description}</p>
            <small className="muted">
              Created: {new Date(forum.creationTime).toLocaleString()}
            </small>

            {canEditForum && (
              <div style={{ marginTop: '1rem' }}>
                <hr />
                <h4>Edit Forum</h4>
                <form onSubmit={handleForumUpdate} className="form">
                  <input
                    placeholder="Topic"
                    value={editForum.topic}
                    onChange={(e) => setEditForum({ ...editForum, topic: e.target.value })}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <textarea
                    placeholder="Description"
                    value={editForum.description}
                    onChange={(e) => setEditForum({ ...editForum, description: e.target.value })}
                    style={{ width: '100%', minHeight: 80, marginBottom: '0.5rem' }}
                  />

                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      border: '2px dashed gray',
                      padding: '1rem',
                      textAlign: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    {uploading
                      ? <p>Uploading...</p>
                      : editForum.forumPic
                        ? <img src={editForum.forumPic} alt="preview" style={{ maxWidth: 150 }} />
                        : <p>Drag & drop or click to upload forum image</p>}
                    <input type="file" accept="image/*" onChange={handleBrowse} />
                  </div>

                  <button className="btn" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Save Changes'}
                  </button>
                </form>

                {isAdmin && (
                  <button
                    className="btn"
                    style={{ backgroundColor: 'red', color: 'white', marginTop: '0.5rem' }}
                    onClick={handleForumDelete}
                  >
                    Delete Forum
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Center Column: Threads */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <h3>Threads</h3>

          {user ? (
            <form onSubmit={submitThread} className="form card" style={{ marginBottom: '1rem' }}>
              <textarea
                placeholder="Thread content"
                value={form.description}
                onChange={(e) => setForm({ description: e.target.value })}
                required
                style={{ width: '100%', minHeight: 80, padding: '0.5rem', marginBottom: '0.5rem' }}
              />
              <button className="btn" type="submit">
                Create Thread
              </button>
            </form>
          ) : (
            <p className="muted">Log in to create a thread.</p>
          )}

          <div className="list">
            {threads.length === 0 && <p className="muted">No threads yet.</p>}
            {threads.map((t) => {
              const isMine = user && user.id === t.userId._id;
              const state = editStates[t._id] || {};
              return (
                <article
                  key={t._id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {t.userId.pictureUrl && (
                    <img
                      src={t.userId.pictureUrl}
                      alt={t.userId.username}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 4 }}>
                      <strong>{t.userId.username}</strong>
                      <small
                        className="muted"
                        style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}
                      >
                        • {new Date(t.creationTime).toLocaleString()}
                      </small>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>
                      {t.description}
                    </p>

                    {/* Buttons */}
                    <div
                      style={{
                        marginTop: 4,
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {isMine && (
                        <>
                          {!state.editing && !state.deleteConfirm && (
                            <>
                              <button className="btn" onClick={() => handleEditClick(t._id)}>
                                Edit
                              </button>
                              <button className="btn" onClick={() => handleDeleteClick(t._id)}>
                                Delete
                              </button>
                            </>
                          )}
                          {state.deleteConfirm && (
                            <button
                              className="btn"
                              style={{ backgroundColor: 'red', color: 'white' }}
                              onClick={() => confirmDelete(t._id)}
                            >
                              Confirm Delete
                            </button>
                          )}
                          {state.editing && (
                            <>
                              <textarea
                                placeholder="Add your update"
                                value={editTexts[t._id]}
                                onChange={(e) =>
                                  setEditTexts((prev) => ({
                                    ...prev,
                                    [t._id]: e.target.value,
                                  }))
                                }
                                style={{
                                  width: '100%',
                                  minHeight: 60,
                                  padding: '0.5rem',
                                  marginBottom: '0.5rem',
                                }}
                              />
                              <button
                                className="btn"
                                onClick={() => handleUpdateThread(t)}
                              >
                                Update Thread
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* Admin-only delete */}
                      {isAdmin && !isMine && (
                        <button
                          className="btn"
                          style={{ backgroundColor: 'red', color: 'white' }}
                          onClick={() => confirmDelete(t._id)}
                        >
                          Delete Thread
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 600px) {
            .card {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            .card img {
              margin-bottom: 0.5rem;
            }
          }
        `}
      </style>
    </div>
  );
}
