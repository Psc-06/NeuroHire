import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Interview", path: "/interview" },
  { label: "Analysis", path: "/analysis" },
];

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 w-full z-50"
    >
      <div className="mx-4 mt-3">
        <div className="max-w-7xl mx-auto px-6 py-3 rounded-2xl glass-strong border-glow">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 relative overflow-hidden"
              >
                <Brain className="w-5 h-5 text-primary relative z-10" />
                <div className="absolute inset-0 bg-primary/10 animate-pulse-glow" />
              </motion.div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold gradient-text-alt">Neuro</span>
                <span className="text-xl font-bold text-foreground">Hire</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-muted/30">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-primary/15 border border-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1.5 text-xs text-primary font-medium"
              >
                <Sparkles size={12} />
                AI Active
              </motion.div>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden mx-4 mt-2 rounded-xl glass-strong px-4 pb-4 pt-2 flex flex-col gap-1"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </motion.nav>
      )}
    </motion.header>
  );
};

export default Header;
