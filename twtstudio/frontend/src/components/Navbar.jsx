import { NavLink } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/images/logo/horizontal.png";
import LogoWhite from "../assets/images/logo/horizontal-white.png";
import Typography from "./Typography";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const controls = useAnimation();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide/show navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        controls.start({ opacity: 0, y: -40 });
      } else {
        controls.start({ opacity: 1, y: 0 });
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, controls]);

  // Prevent scroll and add backdrop blur when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: "Studio", path: "/studio" },
    { label: "Learning", path: "/learning" },
    { label: "Careers", path: "/careers" },
    { label: "Insights", path: "/insights" },
    { label: "Appointment", path: "/appointment" },
  ];

  return (
    <>
      {/* Navbar */}
      <motion.nav
        animate={controls}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] rounded-full px-6 sm:px-8 z-50 shadow-md flex items-center justify-between h-16 sm:h-20 ${
          theme === "dark"
            ? "bg-gray-900/80 border border-gray-700"
            : "bg-[#FDFCF6] border border-gray-200"
        } backdrop-blur-xs`}
      >
        {/* Logo */}
        <NavLink to="/" className="flex items-center space-x-2 h-full" onClick={() => setIsMobileMenuOpen(false)}>
          <img src={theme === "dark" ? LogoWhite : Logo} alt="twt Logo" className="h-9 sm:h-9 w-auto object-contain"/>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } hover:text-red-500 transition-colors ${
                  isActive ? "text-red-500 font-medium" : ""
                }`
              }
            >
              <Typography variant="body" as="span" className="text-inherit">
                {item.label || "Home"}
              </Typography>
            </NavLink>
          ))}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              theme === "dark" ? "bg-gray-700" : "bg-[#FDFCF6]"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-2 rounded-md ${
            theme === "dark" ? "text-[#FEFEF8]" : "text-gray-800"
          }`}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <motion.div
        initial={{ x: "100%" }}
        animate={isMobileMenuOpen ? { x: 0 } : { x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 right-0 w-4/5 max-w-sm h-full z-50 p-6 md:hidden ${
          theme === "dark"
            ? "bg-gray-900 text-[#FEFEF8]"
            : "bg-[#FDFCF6] text-gray-800"
        } shadow-2xl`}
      >
        <div className="flex justify-between items-center mb-12 pt-4">
          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold">
            <img
            src={Logo}
            alt="twt Logo"
            className="h-9 sm:h-9 w-auto object-contain"
            style={{
              filter: theme === "dark" ? "invert(1)" : "invert(0)",
            }}
          />
          </NavLink>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col space-y-6">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `py-3 px-4 rounded-lg text-lg ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } hover:text-red-500 transition-colors ${
                  isActive
                    ? `text-red-500 font-medium ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`
                    : ""
                }`
              }
            >
              <Typography variant="h6" as="span" className="text-inherit">
                {item.label || "Home"}
              </Typography>
            </NavLink>
          ))}

          <button
            onClick={() => {
              toggleTheme();
              setIsMobileMenuOpen(false);
            }}
            className={`mt-8 py-3 px-4 rounded-lg w-full text-left flex items-center gap-2 ${
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
          >
            {theme === "light" ? (
              <>
                <span>🌙</span> <Typography variant="body" as="span">Dark Mode</Typography>
              </>
            ) : (
              <>
                <span>☀️</span> <Typography variant="body" as="span">Light Mode</Typography>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;
