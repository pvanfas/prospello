import React, { useState } from "react";
import { ChevronRight, Phone, User, Gift, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import api from "../services/api";

const OTP_SIGNUP_FLOW = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: "", message: "" });
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone_number: "",
        role: "",
        refercode: "",
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(
            () => setToast({ show: false, type: "", message: "" }),
            3000
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d*$/.test(pasted)) return;        
        const newOtp = [...otp];
        pasted.split('').forEach((ch, i) => (newOtp[i] = ch));
        setOtp(newOtp);
       
        const last = Math.min(pasted.length, 5);
        document.getElementById(`otp-${last}`)?.focus();
      };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.username || !formData.phone_number) {
                showToast("error", "Username and phone number are required");
                return false;
            }
        } else if (step === 2) {
            if (!formData.role) {
                showToast("error", "Please select a role");
                return false;
            }
        }
        return true;
    };

    const handleNextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const send_otp = async () => {
        try {
            setIsLoading(true);
            // Simulate API call
            const response = await api.post("/v1/auth/send-otp/", {
                phone_number: formData.phone_number,
            });
            if (response.status === 200) {
                showToast("success", "OTP sent successfully");
                console.log("OTP sent to:", formData.phone_number);
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            if(error.response.data.detail == "User already exists"){
                showToast("error", "User already exists");
                navigate("/login");
            }
            else{
                showToast("error", "Failed to send OTP");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setIsLoading(true);
            if(formData.email.trim() == "" ){
                formData.email = null;
            }
            const response = await api.post("/v1/auth/signup/", {...formData,otp:otp.join('') });
            if (response.status === 201) {
                showToast(
                    "success",
                    "OTP verified and account created successfully"
                );
                dispatch(
                    loginSuccess({
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        user: response.data.user,
                    })
                );
                navigate("/");
            }
            console.log("Verifying OTP:", otp.join(""));
            console.log("Form data:", formData);
        } catch (error) {
            showToast("error", "Failed to verify OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const maskPhoneNumber = (phone) => {
        if (phone.length <= 4) return `+91 ${phone}`;
        const visiblePart = phone.slice(-4);
        const maskedPart = "•".repeat(phone.length - 4);
        return `+91 ${maskedPart}${visiblePart}`;
    };

    const isOtpComplete = otp.every((digit) => digit !== "");

    const steps = [
        { number: 1, label: "Basic Info", icon: User },
        { number: 2, label: "Role", icon: Gift },
        { number: 3, label: "Refer Code", icon: Lock },
        { number: 4, label: "Verify", icon: Phone },
    ];

    const StepIcon = steps[step - 1].icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex flex-col">
            {/* Toast */}
            {toast.show && (
                <div
                    className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
                        toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex-shrink-0 px-4 py-6 sm:px-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <StepIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {step === 1
                            ? "Create Account"
                            : step === 2
                            ? "Select Role"
                            : step === 3
                            ? "Referral Code"
                            : "Verify Phone"}
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        {step === 1
                            ? "Start with your basic information"
                            : step === 2
                            ? "Choose your role on our platform"
                            : step === 3
                            ? "Enter referral code (optional)"
                            : "Enter the code sent to your phone"}
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="px-4 sm:px-6">
                <div className="max-w-sm mx-auto">
                    <div className="flex justify-between mb-8">
                        {steps.map((s, index) => {
                            const IconComponent = s.icon;
                            return (
                                <div
                                    key={s.number}
                                    className="flex items-center"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            step >= s.number
                                                ? "bg-gradient-to-r from-orange-500 to-teal-500 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`w-8 h-1 mx-2 transition-all duration-300 ${
                                                step > s.number
                                                    ? "bg-gradient-to-r from-orange-500 to-teal-500"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 pb-8 sm:px-6">
                <div className="max-w-sm mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-8 sm:px-8">
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Username *
                                            </label>
                                            <input
                                                name="username"
                                                type="text"
                                                required
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                placeholder="Choose a username"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email (optional)
                                            </label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Enter your email"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-lg text-sm">
                                                    +91
                                                </div>
                                                <input
                                                    name="phone_number"
                                                    type="tel"
                                                    required
                                                    value={
                                                        formData.phone_number
                                                    }
                                                    onChange={handleInputChange}
                                                    placeholder="98765 43210"
                                                    className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleNextStep}
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                        >
                                            Continue{" "}
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Role */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-4">
                                            Select your role *
                                        </label>
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    value: "shipper",
                                                    label: "📦 Shipper",
                                                    desc: "Send shipments",
                                                },
                                                {
                                                    value: "broker",
                                                    label: "🤝 Broker",
                                                    desc: "Connect shippers & drivers",
                                                },
                                                {
                                                    value: "driver",
                                                    label: "🚛 Driver",
                                                    desc: "Deliver shipments",
                                                },
                                            ].map((role) => (
                                                <label
                                                    key={role.value}
                                                    className="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200"
                                                    style={{
                                                        borderColor:
                                                            formData.role ===
                                                            role.value
                                                                ? "#f97316"
                                                                : "#e5e7eb",
                                                        backgroundColor:
                                                            formData.role ===
                                                            role.value
                                                                ? "#fff7ed"
                                                                : "#ffffff",
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value={role.value}
                                                        checked={
                                                            formData.role ===
                                                            role.value
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                    <div className="ml-3">
                                                        <div className="font-semibold text-gray-900">
                                                            {role.label}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {role.desc}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNextStep}
                                            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center"
                                        >
                                            Continue{" "}
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Refer Code */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Referral Code (optional)
                                        </label>
                                        <input
                                            name="refercode"
                                            type="text"
                                            value={formData.refercode}
                                            onChange={handleInputChange}
                                            placeholder="Enter referral code if you have one"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            You'll get a referral code after
                                            verification
                                        </p>
                                    </div>

                                    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                                        <p className="text-sm text-teal-900">
                                            💡 Referral codes help you earn
                                            rewards. If you don't have one,
                                            you'll get one to share after
                                            signup.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => {
                                                send_otp();
                                                setStep(4);
                                            }}
                                            disabled={isLoading}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send OTP{" "}
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: OTP Verification */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="text-center pb-4">
                                        <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <Phone className="w-8 h-8 text-teal-600" />
                                        </div>
                                        <p className="text-gray-600 text-sm mb-1">
                                            Verification code sent to
                                        </p>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {maskPhoneNumber(
                                                formData.phone_number
                                            )}
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
                                                    onPaste={(e) =>
                                                        handleOtpPaste(e)
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleOtpKeyDown(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    
                                                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50"
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={verifyOtp}
                                            disabled={
                                                !isOtpComplete || isLoading
                                            }
                                            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    Verify Code{" "}
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="text-center space-y-3">
                                        <button
                                            onClick={() => setStep(3)}
                                            className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
                                        >
                                            ← Back
                                        </button>

                                        <div className="text-sm text-gray-600">
                                            Didn't receive the code?{" "}
                                            <button
                                                onClick={send_otp}
                                                disabled={isLoading}
                                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                                            >
                                                Resend
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600 text-sm">
                            Already have an account?{" "}
                            <button className="text-orange-600 hover:text-orange-700 font-semibold">
                                Log in
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTP_SIGNUP_FLOW;
