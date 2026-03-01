import React, { useCallback, useEffect, useState, useContext } from 'react';
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

  const load = useCallback(async () => {
    try {
      const f = await API.get(`/forums/${id}`);
      setForum(f.data);
      setEditForum({
        topic: f.data.topic,
        description: f.data.description,
        forumPic: f.data.forumPic || ''
      });
      const allThreads = await API.get('/threads');
      const forumId = String(f.data?._id || id);
      const normalizeForumId = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val._id ? String(val._id) : '';
      };
      setThreads(allThreads.data.filter((t) => normalizeForumId(t.forumId) === forumId));
    } catch {
      alert('Failed to load forum');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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
    <div className="container">
      <div className="split">
        {/* Forum Info Sidebar */}
        {forum && (
          <div
            className="card sidebar forum-sidebar"
          >
            <h2 className="page-title" style={{ textAlign: 'left', marginTop: 0, marginBottom: 8 }}>
              {forum.topic}
            </h2>
            {forum.forumPic && (
              <img
                src={forum.forumPic}
                alt={forum.topic}
                style={{ width: '100%', borderRadius: 14, marginBottom: 12, border: '1px solid rgba(255,255,255,0.12)' }}
              />
            )}
            <p className="muted" style={{ marginTop: 0, marginBottom: 10 }}>
              {forum.description}
            </p>
            <small className="muted">
              Created: {new Date(forum.creationTime).toLocaleString()}
            </small>

            {canEditForum && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ height: 14 }} />
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', margin: '10px 0 14px' }} />
                <h4 style={{ margin: 0 }}>Edit forum</h4>
                <form onSubmit={handleForumUpdate} className="form">
                  <input
                    className="input"
                    placeholder="Topic"
                    value={editForum.topic}
                    onChange={(e) => setEditForum({ ...editForum, topic: e.target.value })}
                  />
                  <textarea
                    className="textarea"
                    placeholder="Description"
                    value={editForum.description}
                    onChange={(e) => setEditForum({ ...editForum, description: e.target.value })}
                    style={{ minHeight: 90 }}
                  />

                  <div
                    className="dropzone"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {uploading
                      ? <p className="muted" style={{ margin: 0 }}>Uploading...</p>
                      : editForum.forumPic
                        ? <img src={editForum.forumPic} alt="preview" style={{ maxWidth: 220, borderRadius: 14 }} />
                        : <p className="muted" style={{ margin: 0 }}>Drag & drop or click to upload a forum cover</p>}
                    <input type="file" accept="image/*" onChange={handleBrowse} />
                  </div>

                  <button className="btn" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Save changes'}
                  </button>
                </form>

                {isAdmin && (
                  <button
                    className="btn btn-danger"
                    style={{ marginTop: 10 }}
                    onClick={handleForumDelete}
                  >
                    Delete Forum
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Threads Column */}
        <div className="threads-column">
          <h3 style={{ marginTop: 0 }}>Threads</h3>

          {user ? (
            <form onSubmit={submitThread} className="form card" style={{ marginBottom: 14 }}>
              <textarea
                className="textarea"
                placeholder="Thread content"
                value={form.description}
                onChange={(e) => setForm({ description: e.target.value })}
                required
                style={{ minHeight: 90 }}
              />
              <button className="btn" type="submit">
                Create Thread
              </button>
            </form>
          ) : (
            <div className="card" style={{ marginBottom: 14 }}>
              <p className="muted" style={{ margin: 0 }}>Log in to create a thread.</p>
            </div>
          )}

          <div className="list">
            {threads.length === 0 && <p className="muted">No threads yet.</p>}
            {threads.map((t) => {
              const isMine = user && user.id === t.userId._id;
              const state = editStates[t._id] || {};
              return (
                <article
                  key={t._id}
                  className="card thread-card"
                >
                  {t.userId.pictureUrl ? (
                    <img src={t.userId.pictureUrl} alt={t.userId.username} className="avatar" />
                  ) : (
                    <div className="avatar" aria-hidden="true" style={{ display: 'grid', placeItems: 'center' }}>
                      <span style={{ fontWeight: 800 }}>
                        {String(t.userId.username || 'U').slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <div className="thread-meta">
                      <strong>{t.userId.username}</strong>
                      <small
                        className="muted"
                        style={{ fontSize: '0.8rem' }}
                      >
                        • {new Date(t.creationTime).toLocaleString()}
                      </small>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                      {t.description}
                    </p>

                    {/* Buttons */}
                    <div
                      className="thread-actions"
                    >
                      {isMine && (
                        <>
                          {!state.editing && !state.deleteConfirm && (
                            <>
                              <button className="btn btn-secondary" onClick={() => handleEditClick(t._id)}>
                                Edit
                              </button>
                              <button className="btn btn-secondary" onClick={() => handleDeleteClick(t._id)}>
                                Delete
                              </button>
                            </>
                          )}
                          {state.deleteConfirm && (
                            <button
                              className="btn btn-danger"
                              onClick={() => confirmDelete(t._id)}
                            >
                              Confirm Delete
                            </button>
                          )}
                          {state.editing && (
                            <>
                              <textarea
                                className="textarea"
                                placeholder="Add your update"
                                value={editTexts[t._id]}
                                onChange={(e) =>
                                  setEditTexts((prev) => ({
                                    ...prev,
                                    [t._id]: e.target.value,
                                  }))
                                }
                                style={{ minHeight: 80 }}
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
                          className="btn btn-danger"
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
    </div>
  );
}
