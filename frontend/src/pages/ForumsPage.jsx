import React, { useEffect, useState, useContext } from 'react';
import API from '../api/api';
import ForumCard from '../components/Forumcard';
import { AuthContext } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function ForumsPage() {
  const [forums, setForums] = useState([]);
  const [form, setForm] = useState({ topic: '', description: '', forumPic: '' });
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      const res = await API.get('/forums');
      setForums(res.data);
    } catch {
      alert('Failed to load forums');
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, forumPic: url }));
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

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/forums', form);
      setForm({ topic: '', description: '', forumPic: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Create forum failed');
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Forums</h2>

      {user ? (
        <section className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>Create a forum</h3>
          <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
            Start a new space for threads. Add an optional cover image.
          </p>
          <form onSubmit={submit} className="form">
            <div className="grid-2">
              <input
                className="input"
                placeholder="Topic"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Short description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div
              className="dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {uploading ? (
                <p className="muted" style={{ margin: 0 }}>Uploading...</p>
              ) : form.forumPic ? (
                <img src={form.forumPic} alt="preview" style={{ maxWidth: 220, borderRadius: 14 }} />
              ) : (
                <p className="muted" style={{ margin: 0 }}>Drag & drop or click to upload a forum cover</p>
              )}
              <input type="file" accept="image/*" onChange={handleBrowse} />
            </div>

            <button className="btn" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Create forum'}
            </button>
          </form>
        </section>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="muted" style={{ margin: 0 }}>Log in to create a forum.</p>
        </div>
      )}

      <section className="list">
        {forums.map(f => <ForumCard key={f._id || f.id} forum={f} />)}
      </section>
    </div>
  );
}
