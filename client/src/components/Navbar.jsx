import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import RoleBadge from "./RoleBadge.jsx";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="text-xl font-semibold tracking-tight text-white">
          FreelanceChain
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 ${isActive ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"}`
            }
          >
            Jobs
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 ${
                    isActive ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-slate-300">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-slate-300 hover:text-white">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-brand-500 px-4 py-2 text-white">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

