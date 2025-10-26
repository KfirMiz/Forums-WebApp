import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^(?=.*[A-Za-z])(?=.*\d).+$/.test(value),
      message: 'Password must contain at least one letter and one number.',
    },
  },
  pictureUrl: { type: String, default: '' },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  creationTime: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model('User', userSchema);
