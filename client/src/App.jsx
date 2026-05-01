import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import FreelancerDashboard from "./pages/FreelancerDashboard.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === "client" ? <ClientDashboard /> : <FreelancerDashboard />}
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

