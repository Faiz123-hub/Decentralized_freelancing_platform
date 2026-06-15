import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultWalletForRole, isDefaultWallet } from "../utils/defaultWallets.js";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    walletAddress: getDefaultWalletForRole("client"),
    skills: "",
    bio: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await register(formData);
      navigate("/dashboard");
    } catch (registerError) {
      setError(registerError.response?.data?.message || "Unable to register");
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-panel">
      <h1 className="text-3xl font-semibold text-white">Create your account</h1>
      <p className="mt-2 text-sm text-slate-400">Choose a role, connect your workflow, and start collaborating.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Full name"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          required
        />
        <input
          className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          required
        />
        <input
          className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          required
        />
        <select
          className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          value={formData.role}
          onChange={(event) => {
            const role = event.target.value;
            const shouldUseDefault = !formData.walletAddress || isDefaultWallet(formData.walletAddress);

            setFormData({
              ...formData,
              role,
              walletAddress: shouldUseDefault ? getDefaultWalletForRole(role) : formData.walletAddress
            });
          }}
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>
        <input
          className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Wallet address"
          value={formData.walletAddress}
          onChange={(event) => setFormData({ ...formData, walletAddress: event.target.value })}
        />
        <p className="md:col-span-2 -mt-2 text-xs text-slate-400">
          Temporary default for {formData.role}: {getDefaultWalletForRole(formData.role)}
        </p>
        <input
          className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Skills, comma separated"
          value={formData.skills}
          onChange={(event) => setFormData({ ...formData, skills: event.target.value })}
        />
        <textarea
          className="md:col-span-2 min-h-28 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-brand-400"
          placeholder="Short bio"
          value={formData.bio}
          onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
        />

        {error ? <p className="md:col-span-2 text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          className="md:col-span-2 rounded-2xl bg-brand-500 px-4 py-3 font-medium text-white disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already registered?{" "}
        <Link to="/login" className="text-brand-400">
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
