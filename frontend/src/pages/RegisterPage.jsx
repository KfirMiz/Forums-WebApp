import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', pictureUrl: '' });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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
      const res = await API.post('/users/register', form);
      login(res.data.user, res.data.token);
      //alert('Registered and logged in!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={submit} className="form">
        <input
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        {/* Drag & Drop Zone */}
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
          {uploading ? 'Uploading...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
