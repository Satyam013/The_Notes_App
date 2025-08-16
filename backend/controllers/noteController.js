const asyncHandler = require("express-async-handler");
const Note = require("../models/noteModel");

// Get all notes
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.id });
  res.json(notes);
});

// Create note
const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Please add title and content");
  }

  const note = new Note({ title, content, user: req.user.id });
  const createdNote = await note.save();
  res.status(201).json(createdNote);
});

// Update note
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (note.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  note.title = req.body.title || note.title;
  note.content = req.body.content || note.content;

  const updatedNote = await note.save();
  res.json(updatedNote);
});

// Delete note
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (note.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  await note.deleteOne();
  res.json({ message: "Note removed" });
});

module.exports = { getNotes, createNote, updateNote, deleteNote };
