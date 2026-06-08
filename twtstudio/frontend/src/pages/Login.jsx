import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

// Reusable InputField component
const InputField = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  label,
  autoComplete,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 ">
      {label}
    </label>
    <div className="relative mt-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={onChange}
        className="appearance-none block w-full px-12 py-3 border border-gray-300  placeholder-gray-500 text-gray-900  rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors "
        placeholder={placeholder}
      />
    </div>
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  autoComplete: PropTypes.string.isRequired,
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  }, []);

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Save token and user data to context and localStorage
      login(data.token, data.user);

      console.log(data, "data");

      // Show success message
      toast.success("Login successful!");

      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Trigger the mutation
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FDFCF6] text-gray-700 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-700 ">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 ">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputField
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              icon={User}
              label="Username"
              autoComplete="username"
            />

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 "
              >
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-12 py-3 border border-gray-300  placeholder-gray-500  text-gray-900  rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors pr-12 "
                  placeholder="Password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 " />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 " />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600  text-sm text-center">{error}</div>
          )}

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loginMutation.isPending && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

Login.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]),
};

export default Login;
