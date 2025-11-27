import { useState } from "react";
import { useToast } from "../../components/Toast";
import AdminApi from "../../services/adminApi";
import React from "react";
import { loginSuccess } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const { showToast } = useToast();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSubmit = async () => {
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const response = await AdminApi.post("/v1/admin/login", {
                email,
                password,
            });
            if (response.status === 200) {
                dispatch(
                    loginSuccess({
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        user: response.data.user,
                    })
                );
                showToast("success", "Admin login successful");
                navigate("/admin");
            }
        } catch (error) {
            showToast("error", "Admin login failed");
            console.error("Admin login failed", error);
            console.log("Login attempt:", { email, password });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl font-light text-gray-900 mb-2">
                        Admin Login
                    </h1>
                    <div className="w-12 h-0.5 bg-gray-900 mx-auto"></div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Email field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs uppercase tracking-wider text-gray-500 mb-3 font-medium"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 placeholder-gray-400 outline-none transition-colors duration-200 focus:border-gray-900"
                            placeholder="admin@example.com"
                        />
                    </div>

                    {/* Password field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-xs uppercase tracking-wider text-gray-500 mb-3 font-medium"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleSubmit()
                            }
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 placeholder-gray-400 outline-none transition-colors duration-200 focus:border-gray-900"
                            placeholder="Enter your password"
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="text-xs text-red-600 mt-2">{error}</div>
                    )}

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 mt-8 bg-gray-900 text-white text-sm uppercase tracking-wider font-medium transition-all duration-200 hover:bg-gray-800 active:scale-98"
                    >
                        Sign In
                    </button>
                </div>

                {/* Footer */}
            </div>
        </div>
    );
}
