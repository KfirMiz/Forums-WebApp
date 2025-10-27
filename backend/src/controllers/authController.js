import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// POST /api/users/register
export const register = async (req, res) => {
  try {
    const { username, password, pictureUrl } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password))
      return res.status(400).json({
        message: 'Password must contain at least one letter and one number.',
      });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });

    // Let Mongoose hash the password via pre-save hook
    const user = await User.create({ username, password, pictureUrl });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      user: { id: user._id, username: user.username, role: user.role, pictureUrl: user.pictureUrl },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// POST /api/users/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id, user.role);

    res.json({
      user: { id: user._id, username: user.username, role: user.role, pictureUrl: user.pictureUrl },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
