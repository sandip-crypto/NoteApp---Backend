const express = require('express');
const Note = require('../models/Note');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected - require authentication
router.use(authMiddleware);

// Get all notes for the authenticated user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId })
      .sort({ updatedAt: -1 }); // Sort by most recently updated

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error while fetching notes' });
  }
});

// Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error while fetching note' });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      user: req.userId
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error while creating note' });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { 
        title: title.trim(), 
        content: content.trim(),
        updatedAt: new Date()
      },
      { new: true } // Return the updated document
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error while updating note' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error while deleting note' });
  }
});

module.exports = router;