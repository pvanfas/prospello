import { NavLink } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import LogoLight from "../assets/images/logo/white.png";
import LogoDark from "../assets/images/logo/horizontal.png";
import Typography from "./Typography";

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const controls = useAnimation();
  const [year] = useState(new Date().getFullYear());

  // Back to top button
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const navItems = [
    { path: "", name: "Home" },
    { path: "careers", name: "Careers" },
    { path: "insights", name: "Insights" },
    { path: "studio", name: "Studio" },
    { path: "contact", name: "Contact" },
  ];

  const socialLinks = [
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: <Twitter size={18} />,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      icon: <Linkedin size={18} />,
    },
    {
      name: "Instagram",
      url: "https://instagram.com",
      icon: <Instagram size={18} />,
    },
  ];

  const contactInfo = [
    { icon: <Mail size={18} />, text: "hello@twtventurestudio.com" },
    { icon: <Phone size={18} />, text: "+91 (555) 123-4567" },
    { icon: <MapPin size={18} />, text: "123 Business Ave, San Francisco" },
  ];

  return (
    <motion.footer
      animate={controls}
      initial={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`w-full py-12 px-4 sm:px-6 lg:px-8 ${
        isDark ? "bg-gray-900 text-gray-300" : "bg-[#FDFCF6] text-gray-700"
      } border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <img
                src={isDark ? LogoLight : LogoDark}
                alt="twt Logo"
                className="object-contain max-h-12"
              />
            </div>
            <Typography variant="small" color="secondary">
              Empowering businesses through innovative solutions and strategic
              growth.
            </Typography>
            <div className="flex space-x-4 mt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full ${
                    isDark
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  } transition-colors`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-4">
            <Typography variant="h6" className={isDark ? "text-white" : "text-gray-900"}>
              Navigation
            </Typography>
            <nav className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={`/${item.path}`}
                  className={({ isActive }) =>
                    `text-sm flex items-center gap-1 ${
                      isActive
                        ? isDark
                          ? "text-red-400"
                          : "text-red-600"
                        : isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    } transition-colors`
                  }
                >
                  {item.name}
                  {item.path.includes("http") && <ArrowUpRight size={14} />}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-4">
            <Typography variant="h6" className={isDark ? "text-white" : "text-gray-900"}>
              Contact Us
            </Typography>
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {info.icon}
                  </div>
                  <Typography variant="small" color="secondary">
                    {info.text}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className={`border-t ${
            isDark ? "border-gray-800" : "border-gray-200"
          } my-8`}
        ></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Typography variant="caption" color="muted">
            © {year} TwT Consulting. All rights reserved.
          </Typography>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className={`text-xs ${
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              } transition-colors`}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className={`text-xs ${
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              } transition-colors`}
            >
              Terms of Service
            </a>
            <a
              href="#"
              className={`text-xs ${
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              } transition-colors`}
            >
              Cookie Policy
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className={`p-2 rounded-full ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-red-500 hover:bg-red-400"
            } transition-colors`}
            aria-label="Back to top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
