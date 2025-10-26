import { Forum } from '../models/Forum.js';

// Create forum
export const createForum = async (req, res) => {
  try {
    const forum = await Forum.create(req.body);
    res.status(201).json(forum);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all forums
export const getForums = async (req, res) => {
  const forums = await Forum.find();
  res.json(forums);
};
