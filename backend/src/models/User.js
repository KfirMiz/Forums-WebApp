import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  about: { type: String },
  creationTime: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
