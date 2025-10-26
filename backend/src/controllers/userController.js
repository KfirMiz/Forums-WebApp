import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

// Read all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read one user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== id)
      return res.status(403).json({ message: 'Not authorized' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, password, pictureUrl } = req.body;

    if (username) user.username = username;
    if (password) {
      if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password))
        return res.status(400).json({
          message: 'Password must contain at least one letter and one number.',
        });
      user.password = await bcrypt.hash(password, 10);
    }
    if (pictureUrl) user.pictureUrl = pictureUrl;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== id)
      return res.status(403).json({ message: 'Not authorized' });

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
