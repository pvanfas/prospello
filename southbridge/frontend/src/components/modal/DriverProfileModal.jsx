import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Upload } from "lucide-react";
import { useToast } from "../Toast";
import api from "../../services/api";

const DriverProfileModal = ({ isOpen, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        license_number: "",
        vehicle_type: "",
        max_weight_capacity: 0,
        vehicle_image_base64: null, // Changed to store base64 string
        preferred_routes: "", // Optional field
        // Payment fields
        payment_method: "", // "upi" or "bank"
        upi_id: "",
        bank_account_number: "",
        ifsc_code: "",
        account_holder_name: "",
    });
    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    const vehicleTypes = ["Truck", "Trailer", "Pickup", "Refrigorated","Other"];

    // Reset form on modal open
    useEffect(() => {
        if (isOpen) {
            setFormData({
                license_number: "",
                vehicle_type: "",
                max_weight_capacity: 0,
                vehicle_image_base64: null, // Reset base64 field
                preferred_routes: "", // Reset preferred routes
                payment_method: "",
                upi_id: "",
                bank_account_number: "",
                ifsc_code: "",
                account_holder_name: "",
            });
            setErrors({});
            setImagePreview(null);
        }
    }, [isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showToast("error", "❌ Image size should be less than 5MB");
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                showToast("error", "❌ Please select a valid image file");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                // Store the complete base64 string (including data:image/jpeg;base64, prefix)
                setFormData(prev => ({ ...prev, vehicle_image_base64: base64String }));
                setImagePreview(base64String);
            };
            reader.onerror = () => {
                showToast("error", "❌ Failed to read image file");
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, vehicle_image_base64: null }));
        setImagePreview(null);
        // Clear the file input
        const fileInput = document.getElementById('vehicle-image-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields validation
        if (!formData.license_number.trim()) {
            newErrors.license_number = "License number is required";
        }
        if (!formData.vehicle_type) {
            newErrors.vehicle_type = "Vehicle type is required";
        }
        if (!formData.max_weight_capacity) {
            newErrors.max_weight_capacity = "Max weight capacity is required";
        } else if (
            isNaN(formData.max_weight_capacity) ||
            parseFloat(formData.max_weight_capacity) <= 0
        ) {
            newErrors.max_weight_capacity = "Please enter a valid weight capacity";
        }
        
        // Payment method validation
        if (!formData.payment_method) {
            newErrors.payment_method = "Payment method is required";
        } else if (formData.payment_method === "upi") {
            if (!formData.upi_id.trim()) {
                newErrors.upi_id = "UPI ID is required";
            } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upi_id)) {
                newErrors.upi_id = "Please enter a valid UPI ID";
            }
        } else if (formData.payment_method === "bank") {
            if (!formData.bank_account_number.trim()) {
                newErrors.bank_account_number = "Bank account number is required";
            }
            if (!formData.ifsc_code.trim()) {
                newErrors.ifsc_code = "IFSC code is required";
            } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
                newErrors.ifsc_code = "Please enter a valid IFSC code";
            }
            if (!formData.account_holder_name.trim()) {
                newErrors.account_holder_name = "Account holder name is required";
            }
        }
        
        return newErrors;
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => {
            const newData = {
                ...prev,
                [field]: field === "max_weight_capacity" ? Number(value) : value,
            };
            
            // Clear payment fields when switching payment method
            if (field === "payment_method") {
                if (value === "upi") {
                    newData.bank_account_number = "";
                    newData.ifsc_code = "";
                    newData.account_holder_name = "";
                } else if (value === "bank") {
                    newData.upi_id = "";
                }
            }
            
            return newData;
        });
        
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const resetForm = () => {
        setFormData({
            license_number: "",
            vehicle_type: "",
            max_weight_capacity: 0,
            vehicle_image_base64: null, // Reset base64 field
            preferred_routes: "", // Reset preferred routes
            payment_method: "",
            upi_id: "",
            bank_account_number: "",
            ifsc_code: "",
            account_holder_name: "",
        });
        setErrors({});
        setFocusedField("");
        setImagePreview(null);
    };

    const handleSubmit = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast("error", "❌ Please fix the errors in the form.");
            return;
        }
        
        try {
            // Prepare data according to backend expectations
            const submitData = {
                license_number: formData.license_number,
                vehicle_type: formData.vehicle_type,
                max_weight_capacity: formData.max_weight_capacity,
                preferred_routes: formData.preferred_routes || null,
                vehicle_image: formData.vehicle_image_base64 || null, // Send base64 string or null
            };
            
            // Add payment method fields based on selection
            if (formData.payment_method === "upi") {
                submitData.upi_id = formData.upi_id;
            } else if (formData.payment_method === "bank") {
                submitData.bank_account_number = formData.bank_account_number;
                submitData.ifsc_code = formData.ifsc_code;
                submitData.account_holder_name = formData.account_holder_name;
            }
            
            console.log(submitData);
            
            const response = await api.post("v1/profile/driver/", submitData);
            if (response.status === 201) {
                showToast("success", "✅ Profile created successfully!");
                onSuccess();
                onClose();
                resetForm();
            } else {
                showToast("error", "❌ Failed to create profile.");
            }
        } catch (error) {
            console.log(error);
            if (error.response?.data?.detail) {
                showToast("error", `❌ ${error.response.data.detail}`);
            } else {
                showToast("error", "❌ Failed to create profile.");
            }
        }

        if (onSuccess) onSuccess(formData);
    };

    const handleCancel = () => {
        onClose();
        resetForm();
    };

    const inputClasses = (fieldName) => `
    w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
    bg-white text-slate-800 placeholder-slate-500
    ${
        focusedField === fieldName
            ? "border-orange-500 shadow-md shadow-orange-200"
            : errors[fieldName]
            ? "border-red-600"
            : "border-slate-200 hover:border-slate-300"
    }
    focus:outline-none focus:border-orange-500 focus:shadow-md focus:shadow-orange-200
  `;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm"
                        onClick={(e) =>
                            e.target === e.currentTarget && handleCancel()
                        }
                    >
                        <motion.div
                            initial={{ opacity: 0, y: "100%", scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: "100%", scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full sm:w-full sm:max-w-2xl max-h-[95vh] bg-white sm:rounded-xl shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 sm:px-6 sm:py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                                            Complete Your Driver Profile
                                        </h2>
                                        <p className="mt-1 text-sm sm:text-base text-slate-600">
                                            We need this info to verify your account and set up payments.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-6 sm:py-6 space-y-6">
                                {/* Vehicle Information Section */}
                                <div className="border-b border-slate-200 pb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Vehicle Information</h3>
                                    
                                    {/* License Number */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-800 mb-2">
                                            License Number *
                                        </label>
                                        <motion.input
                                            type="text"
                                            className={inputClasses("license_number")}
                                            placeholder="Enter your license number"
                                            value={formData.license_number}
                                            onChange={(e) =>
                                                handleInputChange("license_number", e.target.value)
                                            }
                                            onFocus={() => setFocusedField("license_number")}
                                            onBlur={() => setFocusedField("")}
                                            animate={
                                                focusedField === "license_number"
                                                    ? { scale: 1.02 }
                                                    : { scale: 1 }
                                            }
                                            transition={{ duration: 0.2 }}
                                        />
                                        {errors.license_number && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.license_number}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Vehicle Type */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-800 mb-2">
                                            Vehicle Type *
                                        </label>
                                        <motion.select
                                            className={inputClasses("vehicle_type")}
                                            value={formData.vehicle_type}
                                            onChange={(e) =>
                                                handleInputChange("vehicle_type", e.target.value)
                                            }
                                            onFocus={() => setFocusedField("vehicle_type")}
                                            onBlur={() => setFocusedField("")}
                                            animate={
                                                focusedField === "vehicle_type"
                                                    ? { scale: 1.02 }
                                                    : { scale: 1 }
                                            }
                                            transition={{ duration: 0.2 }}
                                        >
                                            <option value="">Select vehicle type</option>
                                            {vehicleTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </motion.select>
                                        {errors.vehicle_type && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.vehicle_type}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Max Weight Capacity */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-800 mb-2">
                                            Max Weight Capacity (kg) *
                                        </label>
                                        <motion.input
                                            type="number"
                                            className={inputClasses("max_weight_capacity")}
                                            placeholder="Enter maximum weight capacity"
                                            value={formData.max_weight_capacity}
                                            onChange={(e) =>
                                                handleInputChange("max_weight_capacity", e.target.value)
                                            }
                                            onFocus={() => setFocusedField("max_weight_capacity")}
                                            onBlur={() => setFocusedField("")}
                                            animate={
                                                focusedField === "max_weight_capacity"
                                                    ? { scale: 1.02 }
                                                    : { scale: 1 }
                                            }
                                            transition={{ duration: 0.2 }}
                                        />
                                        {errors.max_weight_capacity && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.max_weight_capacity}
                                            </motion.p>
                                        )}
                                    </div>


                                    {/* Vehicle Image Upload Field */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-800 mb-2">
                                            Vehicle Image (Optional)
                                        </label>
                                        
                                        {!imagePreview ? (
                                            <motion.label 
                                                htmlFor="vehicle-image-input" 
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all duration-200 border-slate-200 hover:border-slate-300"
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                                    <p className="mb-2 text-sm text-slate-500">
                                                        <span className="font-semibold">Click to upload</span> vehicle image
                                                    </p>
                                                    <p className="text-xs text-slate-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                                                </div>
                                                <input
                                                    id="vehicle-image-input"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </motion.label>
                                        ) : (
                                            <motion.div 
                                                className="relative"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <img
                                                    src={imagePreview}
                                                    alt="Vehicle preview"
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                                                />
                                                <motion.button
                                                    type="button"
                                                    onClick={removeImage}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                                                >
                                                    <X className="w-4 h-4" />
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Preferred Routes */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-800 mb-2">
                                            Preferred Routes (Optional)
                                        </label>
                                        <motion.textarea
                                            rows="3"
                                            className={inputClasses("preferred_routes")}
                                            placeholder="Enter preferred routes (e.g., Mumbai-Delhi, Bangalore-Chennai)"
                                            value={formData.preferred_routes}
                                            onChange={(e) =>
                                                handleInputChange("preferred_routes", e.target.value)
                                            }
                                            onFocus={() => setFocusedField("preferred_routes")}
                                            onBlur={() => setFocusedField("")}
                                            animate={
                                                focusedField === "preferred_routes"
                                                    ? { scale: 1.02 }
                                                    : { scale: 1 }
                                            }
                                            transition={{ duration: 0.2 }}
                                        />
                                    </div>
                                </div>

                                {/* Payment Information Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Information</h3>
                                    
                                    {/* Payment Method Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-800 mb-3">
                                            Payment Method *
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.button
                                                type="button"
                                                onClick={() => handleInputChange("payment_method", "upi")}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center space-y-2 ${
                                                    formData.payment_method === "upi"
                                                        ? "border-orange-500 bg-orange-50 text-orange-700"
                                                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                }`}
                                            >
                                                <Smartphone size={24} />
                                                <span className="font-medium">UPI</span>
                                                <span className="text-xs">Quick & Easy</span>
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                onClick={() => handleInputChange("payment_method", "bank")}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center space-y-2 ${
                                                    formData.payment_method === "bank"
                                                        ? "border-orange-500 bg-orange-50 text-orange-700"
                                                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                }`}
                                            >
                                                <CreditCard size={24} />
                                                <span className="font-medium">Bank Account</span>
                                                <span className="text-xs">Direct Transfer</span>
                                            </motion.button>
                                        </div>
                                        {errors.payment_method && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 text-sm text-red-600"
                                            >
                                                {errors.payment_method}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* UPI Fields */}
                                    {formData.payment_method === "upi" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-slate-800 mb-2">
                                                    UPI ID *
                                                </label>
                                                <motion.input
                                                    type="text"
                                                    className={inputClasses("upi_id")}
                                                    placeholder="yourname@upi (e.g. john@paytm)"
                                                    value={formData.upi_id}
                                                    onChange={(e) =>
                                                        handleInputChange("upi_id", e.target.value)
                                                    }
                                                    onFocus={() => setFocusedField("upi_id")}
                                                    onBlur={() => setFocusedField("")}
                                                    animate={
                                                        focusedField === "upi_id"
                                                            ? { scale: 1.02 }
                                                            : { scale: 1 }
                                                    }
                                                    transition={{ duration: 0.2 }}
                                                />
                                                {errors.upi_id && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-1 text-sm text-red-600"
                                                    >
                                                        {errors.upi_id}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Bank Account Fields */}
                                    {formData.payment_method === "bank" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-slate-800 mb-2">
                                                    Account Holder Name *
                                                </label>
                                                <motion.input
                                                    type="text"
                                                    className={inputClasses("account_holder_name")}
                                                    placeholder="Enter account holder name"
                                                    value={formData.account_holder_name}
                                                    onChange={(e) =>
                                                        handleInputChange("account_holder_name", e.target.value)
                                                    }
                                                    onFocus={() => setFocusedField("account_holder_name")}
                                                    onBlur={() => setFocusedField("")}
                                                    animate={
                                                        focusedField === "account_holder_name"
                                                            ? { scale: 1.02 }
                                                            : { scale: 1 }
                                                    }
                                                    transition={{ duration: 0.2 }}
                                                />
                                                {errors.account_holder_name && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-1 text-sm text-red-600"
                                                    >
                                                        {errors.account_holder_name}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-800 mb-2">
                                                    Bank Account Number *
                                                </label>
                                                <motion.input
                                                    type="text"
                                                    className={inputClasses("bank_account_number")}
                                                    placeholder="Enter bank account number"
                                                    value={formData.bank_account_number}
                                                    onChange={(e) =>
                                                        handleInputChange("bank_account_number", e.target.value)
                                                    }
                                                    onFocus={() => setFocusedField("bank_account_number")}
                                                    onBlur={() => setFocusedField("")}
                                                    animate={
                                                        focusedField === "bank_account_number"
                                                            ? { scale: 1.02 }
                                                            : { scale: 1 }
                                                    }
                                                    transition={{ duration: 0.2 }}
                                                />
                                                {errors.bank_account_number && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-1 text-sm text-red-600"
                                                    >
                                                        {errors.bank_account_number}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-800 mb-2">
                                                    IFSC Code *
                                                </label>
                                                <motion.input
                                                    type="text"
                                                    className={inputClasses("ifsc_code")}
                                                    placeholder="Enter IFSC code (e.g. SBIN0001234)"
                                                    value={formData.ifsc_code}
                                                    onChange={(e) =>
                                                        handleInputChange("ifsc_code", e.target.value.toUpperCase())
                                                    }
                                                    onFocus={() => setFocusedField("ifsc_code")}
                                                    onBlur={() => setFocusedField("")}
                                                    animate={
                                                        focusedField === "ifsc_code"
                                                            ? { scale: 1.02 }
                                                            : { scale: 1 }
                                                    }
                                                    transition={{ duration: 0.2 }}
                                                />
                                                {errors.ifsc_code && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-1 text-sm text-red-600"
                                                    >
                                                        {errors.ifsc_code}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="bg-white border-t border-slate-200 p-6 mb-16 sm:mb-0">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <motion.button
                                        onClick={handleSubmit}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{ backgroundColor: "#FF6B35" }}
                                        className="w-full sm:flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg hover:bg-orange-600 order-2 sm:order-1"
                                    >
                                        Save & Continue
                                    </motion.button>
                                    <motion.button
                                        onClick={handleCancel}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors duration-200 order-1 sm:order-2"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DriverProfileModal;