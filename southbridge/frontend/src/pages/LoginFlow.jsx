import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import api from "../services/api";
import { loginSuccess } from "../redux/authSlice";
import { useDispatch } from "react-redux";

const LoginFlow = () => {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handlePhoneChange = (e) => {
        // Allow only numbers
        const value = e.target.value.replace(/\D/g, "");
        setPhone(value);
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;

        // Only allow numbers
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus to next input
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`).focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        
        if (pasteData.length > 0) {
            // Create a 6-element array with the pasted digits
            const newOtp = [...otp];
            for (let i = 0; i < 6; i++) {
                newOtp[i] = pasteData[i] || '';
            }
            setOtp(newOtp);
            
            // Focus on the next empty field or the last filled field
            const nextEmptyIndex = Math.min(pasteData.length, 5);
            setTimeout(() => {
                const nextInput = document.getElementById(`otp-${nextEmptyIndex}`);
                if (nextInput) {
                    nextInput.focus();
                }
            }, 0);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            alert("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/v1/auth/send-login-otp", {
                phone_number: phone,
            });
            if (response.status === 200) {
                showToast("success", "OTP sent successfully");
                setIsLoading(false);
                setStep(2);
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            showToast("error", error.response.data.detail);
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        // Simulate verification
        try {
            const response = await api.post("/v1/auth/login/otp/", {
                phone_number: phone,
                otp: otp.join(""),
            });
            if (response.status === 200) {
                showToast("success", "OTP verified successfully");
                // console.log('====================================');
                // console.log({ accessToken: response.access_token, refreshToken: response.refresh_token, user: response.user });
                // console.log('====================================');
                dispatch(
                    loginSuccess({
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        user: response.data.user,
                    })
                );
                navigate("/");
                // Proceed with login
            }
        } catch (error) {
            console.error("Error verifying OTP:", error.response);
            showToast("error", error.response.data.detail);
        }
        setIsLoading(false);
    };

    const maskPhoneNumber = (phone) => {
        if (phone.length <= 4) return `+91 ${phone}`;
        const visiblePart = phone.slice(-4);
        const maskedPart = "•".repeat(phone.length - 4);
        return `+91 ${maskedPart}${visiblePart}`;
    };

    const isOtpComplete = otp.every((digit) => digit !== "");

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex flex-col justify-center">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-6 sm:px-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {step === 1 ? "Welcome Back" : "Verify Phone"}
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        {step === 1
                            ? "Sign in to your account"
                            : "Enter the code sent to your phone"}
                    </p>
                </div>
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center px-4 pb-8 sm:px-6">
                <div className="w-full max-w-sm">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-8 sm:px-8">
                            {step === 1 ? (
                                // Phone Login Step
                                <div className="space-y-6">
                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="block text-sm font-semibold text-gray-700 mb-2"
                                        >
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-lg text-sm">
                                                +91
                                            </div>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                placeholder="98765 43210"
                                                className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            disabled={
                                                isLoading || phone.length < 10
                                            }
                                            onClick={handleSendOtp}
                                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Sending OTP...
                                                </div>
                                            ) : (
                                                "Send OTP"
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500 font-medium">
                                                or
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 flex items-center justify-center text-base"
                                    >
                                        <svg
                                            className="w-5 h-5 mr-3"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                            ) : (
                                // OTP Verification Step
                                <div className="space-y-6">
                                    <div className="text-center pb-4">
                                        <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-teal-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-1">
                                            Verification code sent to
                                        </p>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {maskPhoneNumber(phone)}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-center space-x-2">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) =>
                                                        handleOtpChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleOtpKeyDown(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    onPaste={index === 0 ? handleOtpPaste : undefined}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50"
                                                />
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={
                                                !isOtpComplete || isLoading
                                            }
                                            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Verifying...
                                                </div>
                                            ) : (
                                                "Verify & Continue"
                                            )}
                                        </button>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <button
                                            type="button"
                                            className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
                                            onClick={() => setStep(1)}
                                        >
                                            ← Change phone number
                                        </button>

                                        <div className="text-sm text-gray-600">
                                            Didn't receive the code?{" "}
                                            <button
                                                type="button"
                                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                                                onClick={handleSendOtp}
                                            >
                                                Resend
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500 font-medium">
                                                or
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 flex items-center justify-center text-base"
                                    >
                                        <svg
                                            className="w-5 h-5 mr-3"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sign up link */}
                    <div className="text-center mt-6">
                        <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-orange-600 hover:text-orange-700"
                            >
                                Sign up
                            </Link>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginFlow;
