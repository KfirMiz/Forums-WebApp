import React, { useContext, useState } from 'react';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function ProfilePage() {
  const { user, updateUserLocal } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    currentPassword: '', // <-- new field
    pictureUrl: user?.pictureUrl || ''
  });
  const [uploading, setUploading] = useState(false);

  if (!user) return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card">
        <h2 className="page-title" style={{ marginTop: 0 }}>Profile</h2>
        <p className="muted" style={{ marginBottom: 0 }}>Please log in to view your profile.</p>
      </div>
    </div>
  );

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, pictureUrl: url }));
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
      // Only send currentPassword if user entered a new password
      const payload = { ...form };
      if (!form.password) delete payload.currentPassword;

      const res = await API.put(`/users/${user.id || user._id}`, payload);
      updateUserLocal({ ...res.data, id: res.data._id || res.data.id });
      alert('Profile updated');
      // Clear password fields after update
      setForm((prev) => ({ ...prev, password: '', currentPassword: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {user.pictureUrl ? (
            <img src={user.pictureUrl} alt={user.username} className="avatar" style={{ width: 56, height: 56 }} />
          ) : (
            <div className="avatar" aria-hidden="true" style={{ display: 'grid', placeItems: 'center' }}>
              <span style={{ fontWeight: 800 }}>{String(user.username || 'U').slice(0, 1).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h2 className="page-title" style={{ margin: 0 }}>Profile</h2>
            <p className="muted" style={{ margin: 0 }}>Update your username, password, and avatar.</p>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <form onSubmit={submit} className="form">
          <div className="grid-2">
            <input
              className="input"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <div className="muted" style={{ alignSelf: 'center', fontSize: 13 }}>
              Role: <strong style={{ color: 'rgba(255,255,255,0.92)' }}>{user.role}</strong>
            </div>
          </div>

          <div className="grid-2">
            <input
              className="input"
              placeholder="Current password"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
            <input
              className="input"
              placeholder="New password (optional)"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {uploading ? (
              <p className="muted" style={{ margin: 0 }}>Uploading...</p>
            ) : form.pictureUrl ? (
              <img src={form.pictureUrl} alt="preview" className="avatar" style={{ width: 86, height: 86 }} />
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                Drag & drop or click to upload a new profile picture
              </p>
            )}
            <input type="file" accept="image/*" onChange={handleBrowse} />
          </div>

          <button className="btn" type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
