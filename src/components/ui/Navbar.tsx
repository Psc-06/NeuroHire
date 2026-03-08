import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Brain, LayoutDashboard, Sparkles, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  onLogout?: () => void;
  showBackToDashboard?: boolean;
  title?: string;
  showLinks?: boolean;
}

const navItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Interview", path: "/interview" },
  { label: "Analysis", path: "/analysis" },
];

export default function Navbar({ onLogout, showBackToDashboard, title, showLinks = true }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem("adminAuth");
      sessionStorage.removeItem("recruiterAuth");
      sessionStorage.removeItem("candidateAuth");
      navigate("/");
    }
  };

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isCandidateRoute = location.pathname.startsWith("/candidate");

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 left-0 right-0 z-[80]"
    >
      <div className="mx-4 mt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 rounded-2xl glass border border-gray-800/80">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
                  {title || "NeuroHire"}
                </h1>
                <p className="text-xs text-gray-400">Behavior-Based Hiring Analytics</p>
              </div>
            </Link>

            {showLinks && (
              <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-gray-900/60 border border-gray-800">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path} className="relative">
                    {location.pathname === item.path && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-lg bg-indigo-500/20 border border-indigo-400/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative z-10 block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        location.pathname === item.path
                          ? "text-indigo-300"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
            )}

            <div className="hidden md:flex items-center gap-2">
              {showLinks && !onLogout && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-indigo-300 font-medium mr-1">
                  <Sparkles size={12} />
                  AI Active
                </div>
              )}
              {showBackToDashboard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isAdminRoute) {
                      navigate("/admin/dashboard");
                    } else if (isCandidateRoute) {
                      navigate("/candidate-login");
                    } else {
                      navigate("/dashboard");
                    }
                  }}
                  className="items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              )}
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              )}
            </div>

            <button
              className="md:hidden text-gray-200"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && showLinks && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden mx-4 mt-2 rounded-xl glass border border-gray-800 px-3 pb-3 pt-2"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </motion.nav>
      )}
    </motion.header>
  );
}
