import React, { useEffect, useState, useContext } from 'react';
import API from '../api/api';
import ForumCard from '../components/ForumCard';
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
    <div>
      <h2>Forums</h2>

      {user ? (
        <section className="card">
          <h3>Create Forum</h3>
          <form onSubmit={submit} className="form">
            <input placeholder="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required />
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                border: '2px dashed gray',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}
            >
              {uploading
                ? <p>Uploading...</p>
                : form.forumPic
                  ? <img src={form.forumPic} alt="preview" style={{ maxWidth: 150 }} />
                  : <p>Drag & drop or click to upload forum image</p>}
              <input type="file" accept="image/*" onChange={handleBrowse} />
            </div>

            <button className="btn" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Create'}
            </button>
          </form>
        </section>
      ) : (
        <p className="muted">Log in to create a forum.</p>
      )}

      <section className="list">
        {forums.map(f => <ForumCard key={f._id || f.id} forum={f} />)}
      </section>
    </div>
  );
}
