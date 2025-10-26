import { Forum } from '../models/Forum.js';

// ✅ Create Forum
export const createForum = async (req, res) => {
  try {
    const forum = new Forum({
      ...req.body,
      creatorId: req.user.id,
    });
    await forum.save();
    res.status(201).json(forum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Read All
export const getForums = async (req, res) => {
  try {
    const forums = await Forum.find();
    res.json(forums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Read One
export const getForumById = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });
    res.json(forum);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update
export const updateForum = async (req, res) => {
  try {
    const { id } = req.params;
    const forum = await Forum.findById(id);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });

    if (req.user.role !== 'admin' && req.user.id !== forum.creatorId.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const { title, description, pictureUrl } = req.body;
    if (title) forum.title = title;
    if (description) forum.description = description;
    if (pictureUrl) forum.pictureUrl = pictureUrl;

    await forum.save();
    res.json(forum);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete
export const deleteForum = async (req, res) => {
  try {
    const { id } = req.params;
    const forum = await Forum.findById(id);
    if (!forum) return res.status(404).json({ message: 'Forum not found' });

    if (req.user.role !== 'admin' && req.user.id !== forum.creatorId.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await Forum.findByIdAndDelete(id);
    res.json({ message: 'Forum deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
