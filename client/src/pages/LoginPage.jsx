import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await login(formData);
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError.response?.data?.message || "Unable to log in");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-panel">
      <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in to manage jobs, applications, and escrow payments.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          required
        />
        <input
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          required
        />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-medium text-white disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Need an account?{" "}
        <Link to="/register" className="text-brand-400">
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;

