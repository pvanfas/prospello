import { useTheme } from "../context/ThemeContext";
import { NavLink } from "react-router-dom";

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-[#FDFCF6]"
      }`}
    >
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl  mb-6 text-red-500">404</h1>
        <h2 className="text-3xl  mb-4 dark:text-gray-300 text-white">
          Page Not Found
        </h2>
        <p
          className={`text-lg mb-8 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <NavLink
          to="/"
          className={`inline-block px-6 py-3 rounded-lg ${
            theme === "dark"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-red-600 hover:bg-red-700"
          } text-[#FEFEF8] font-medium transition-colors`}
        >
          Return Home
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
