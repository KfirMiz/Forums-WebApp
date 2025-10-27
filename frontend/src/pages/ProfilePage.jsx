import React, { useContext, useState } from 'react';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function ProfilePage() {
  const { user, updateUserLocal } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    pictureUrl: user?.pictureUrl || ''
  });
  const [uploading, setUploading] = useState(false);

  if (!user) return <p>Please log in to view profile.</p>;

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, pictureUrl: url }));
    } catch (err) {
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
      const res = await API.put(`/users/${user.id || user._id}`, form);
      updateUserLocal({ ...res.data, id: res.data._id || res.data.id });
      alert('Profile updated');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="card">
      <h2>Profile</h2>
      <form onSubmit={submit} className="form">
        <input
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          placeholder="New password (optional)"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

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
            : form.pictureUrl
              ? <img src={form.pictureUrl} alt="preview" style={{ maxWidth: 120, borderRadius: '50%' }} />
              : <p>Drag & drop or click to upload profile picture</p>}
          <input type="file" accept="image/*" onChange={handleBrowse} />
        </div>

        <button className="btn" type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
