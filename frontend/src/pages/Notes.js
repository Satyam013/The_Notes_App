import { useContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";

export default function Notes() {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [query, setQuery] = useState("");

  // form state for create
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  const load = async () => {
    setErr("");
    setOk("");
    try {
      setLoading(true);
      const { data } = await api.get("/notes");
      // sort by updatedAt desc if present
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
      setNotes(sorted);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createNote = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!newTitle.trim() || !newContent.trim()) {
      setErr("Please provide both title and content.");
      return;
    }
    try {
      const { data } = await api.post("/notes", {
        title: newTitle,
        content: newContent,
      });
      setNotes((prev) => [data, ...prev]);
      setNewTitle("");
      setNewContent("");
      setOk("Note created.");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to create note");
    }
  };

  const openEdit = (note) => {
    setEditNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditOpen(true);
  };

  const updateNote = async () => {
    if (!editNote) return;
    setErr("");
    setOk("");
    try {
      const { data } = await api.put(`/notes/${editNote._id}`, {
        title: editTitle,
        content: editContent,
      });
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
      setOk("Note updated.");
      setEditOpen(false);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to update note");
    }
  };

  const removeNote = async (id) => {
    setErr("");
    setOk("");
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setOk("Note deleted.");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to delete note");
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ErrorAlert message="You must be logged in to view your notes." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <input
          className="w-full md:w-80 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {err && <ErrorAlert message={err} />}
      {ok && <SuccessAlert message={ok} />}

      {/* Create form */}
      <form
        onSubmit={createNote}
        className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-3"
      >
        <input
          className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-1"
          placeholder="Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          type="submit"
        >
          Add Note
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <div key={note._id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(note)}
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeNote(note._id)}
                    className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-700">{note.content}</p>
              {note.updatedAt && (
                <p className="mt-3 text-xs text-gray-400">
                  Updated: {new Date(note.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        title="Edit Note"
        onClose={() => setEditOpen(false)}
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium">Title</label>
          <input
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <label className="block text-sm font-medium">Content</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={updateNote}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              Save changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
