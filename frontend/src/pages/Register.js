import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import ErrorAlert from "../components/ErrorAlert";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { login } = useContext(AuthContext); // auto-login after register (optional)
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Backend route: POST /api/users
      const { data } = await api.post("/users", form);
      // auto-login
      login(data);
      navigate("/notes");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow"
      >
        <h2 className="mb-2 text-center text-2xl font-bold">
          Create your account
        </h2>
        <p className="mb-4 text-center text-gray-600">It’s fast and easy</p>
        <ErrorAlert message={error} />
        <label className="mb-2 block text-sm font-medium">Name</label>
        <input
          className="mb-3 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          className="mb-3 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          className="mb-6 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
          Create account
        </button>
        <p className="mt-3 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
