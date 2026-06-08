import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../Toast"; // Import the useToast hook

// Custom Dialog Components (simplified shadcn/ui implementation)
const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-md"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative w-full max-w-2xl md:rounded-t-2xl md:rounded-b-lg bg-white md:max-h-[90vh] h-[90vh] md:h-auto overflow-hidden">
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ className = "", children, ...props }) => (
    <div
        className={`h-full flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
    >
        {children}
    </div>
);

const DialogHeader = ({ className = "", children }) => (
    <div className={className}>{children}</div>
);

const DialogTitle = ({ className = "", children }) => (
    <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const DialogDescription = ({ className = "", children }) => (
    <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

// Custom Button Component
const Button = ({
    variant = "default",
    size = "default",
    className = "",
    children,
    disabled = false,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
        default: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
        outline: "border border-gray-200 bg-white hover:bg-gray-50 shadow-sm",
        ghost: "hover:bg-gray-100",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    };

    const sizes = {
        default: "h-12 px-5 py-3",
        sm: "h-10 px-4",
        lg: "h-14 px-8",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

// Custom Input Component
const Input = ({ className = "", error = false, ...props }) => (
    <input
        className={`flex h-12 w-full rounded-xl border ${
            error ? "border-red-300" : "border-gray-200"
        } bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${className}`}
        {...props}
    />
);

// Custom Textarea Component
const Textarea = ({ className = "", ...props }) => (
    <textarea
        className={`flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${className}`}
        {...props}
    />
);

// Custom Select Components
const Select = ({ children, value, onValueChange, error = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);

    const handleSelect = (newValue) => {
        setSelectedValue(newValue);
        onValueChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {React.Children.map(children, (child) =>
                React.cloneElement(child, {
                    isOpen,
                    setIsOpen,
                    selectedValue,
                    onSelect: handleSelect,
                    error,
                })
            )}
        </div>
    );
};

const SelectTrigger = ({
    children,
    isOpen,
    setIsOpen,
    className = "",
    error = false,
}) => (
    <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12  items-center justify-between rounded-xl border ${
            error ? "border-red-300" : "border-gray-200"
        } bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${className}`}
    >
        {children}
        <svg
            className="h-4 w-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 9l6 6 6-6"
            />
        </svg>
    </button>
);

const SelectValue = ({
    selectedValue,
    placeholder = "Select...",
    type = "category",
}) => {
    const categories = {
        perishable: "Perishable",
        non_perishable: "Non Perishable",
        high_value: "High Value",
        oversize: "Oversize",
        general: "General",
    };

    const getDisplayValue = () => {
        if (!selectedValue) return placeholder;
        return categories[selectedValue] || selectedValue;
    };

    return (
        <span className={selectedValue ? "text-gray-900" : "text-gray-400"}>
            {getDisplayValue()}
        </span>
    );
};

const SelectContent = ({ children, isOpen, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute top-full z-50 w-full rounded-xl border border-gray-200 bg-white shadow-lg mt-1 overflow-hidden">
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { onSelect })
            )}
        </div>
    );
};

const SelectItem = ({ children, value, onSelect }) => (
    <button
        onClick={() => onSelect(value)}
        className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 focus:bg-orange-50 transition-colors"
    >
        {children}
    </button>
);

// Lucide React Icons (simplified SVG implementations)
const X = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const AlertTriangle = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
    </svg>
);

const GoodsCategory = {
    PERISHABLE: "perishable",
    NON_PERISHABLE: "non_perishable",
    HIGH_VALUE: "high_value",
    OVERSIZE: "oversize",
    GENERAL: "general",
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ open, onOpenChange, onConfirm, loading }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertTriangle size={24} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirm Load Update
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Updating this load will remove all existing bids. This action cannot be undone. Are you sure you want to proceed?
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? "Updating..." : "Update Load"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

// Main Component
const EditLoadModal = ({ open, onOpenChange, load, fetchLoads }) => {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { showToast } = useToast();

    // Form data - initialize with load data
    const [formData, setFormData] = useState({
        goodsType: "",
        weight: "",
        origin: "",
        destination: "",
        dimensions: "",
        specialInstructions: "",
        category: "",
    });

    // Populate form data when load prop changes
    useEffect(() => {
        if (load) {
            setFormData({
                goodsType: load.goods_type || "",
                weight: load.weight ? load.weight.toString() : "",
                origin: load.origin || "",
                destination: load.destination || "",
                dimensions: load.dimensions || "",
                specialInstructions: load.special_instructions || "",
                category: load.category || "",
            });
        }
    }, [load]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.goodsType.trim()) {
            newErrors.goodsType = "Goods type is required";
        }
        if (!formData.weight.trim()) {
            newErrors.weight = "Weight is required";
        }
        if (!formData.origin.trim()) {
            newErrors.origin = "Origin is required";
        }
        if (!formData.destination.trim()) {
            newErrors.destination = "Destination is required";
        }
        if (!formData.category) {
            newErrors.category = "Category is required";
        }

        // Weight validation
        if (formData.weight && isNaN(Number(formData.weight))) {
            newErrors.weight = "Weight must be a valid number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) {
            return;
        }
        setShowConfirmation(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            setLoading(true);
            
            const updateData = {
                origin: formData.origin,
                destination: formData.destination,
                goods_type: formData.goodsType,
                weight: parseFloat(formData.weight),
                dimensions: formData.dimensions,
                special_instructions: formData.specialInstructions,
                category: formData.category,
            };

            const response = await api.put(`/v1/load/${load.id}`, updateData);
            
            if (response.status === 200) {
                showToast("success", "Load updated successfully!");
                fetchLoads();
                setShowConfirmation(false);
                onOpenChange(false);
                setErrors({});
            }
        } catch (error) {
            console.error("Error updating load:", error);
            showToast("error", "Error updating load. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Check if form is valid for Save button
    const isFormValid = () => {
        return (
            formData.goodsType.trim() &&
            formData.weight.trim() &&
            formData.origin.trim() &&
            formData.destination.trim() &&
            formData.category
        );
    };

    const renderEditForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goods Type <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Enter goods type"
                        value={formData.goodsType}
                        onChange={(e) =>
                            handleInputChange("goodsType", e.target.value)
                        }
                        className="w-full"
                        error={!!errors.goodsType}
                    />
                    {errors.goodsType && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            {errors.goodsType}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="Enter weight"
                        value={formData.weight}
                        onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                        }
                        className="w-full"
                        error={!!errors.weight}
                    />
                    {errors.weight && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            {errors.weight}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origin <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Enter origin"
                        value={formData.origin}
                        onChange={(e) =>
                            handleInputChange("origin", e.target.value)
                        }
                        className="w-full"
                        error={!!errors.origin}
                    />
                    {errors.origin && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            {errors.origin}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Enter destination"
                        value={formData.destination}
                        onChange={(e) =>
                            handleInputChange("destination", e.target.value)
                        }
                        className="w-full"
                        error={!!errors.destination}
                    />
                    {errors.destination && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            {errors.destination}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                </label>
                <Select
                    value={formData.category}
                    onValueChange={(value) =>
                        handleInputChange("category", value)
                    }
                    error={!!errors.category}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue
                            selectedValue={formData.category}
                            placeholder="Select category"
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(GoodsCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() +
                                    category.slice(1).replace("_", " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {errors.category}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions
                </label>
                <Input
                    placeholder="L x W x H (optional)"
                    value={formData.dimensions}
                    onChange={(e) =>
                        handleInputChange("dimensions", e.target.value)
                    }
                    className="w-full"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                </label>
                <Textarea
                    placeholder="Any special handling instructions (optional)"
                    value={formData.specialInstructions}
                    onChange={(e) =>
                        handleInputChange("specialInstructions", e.target.value)
                    }
                    className="w-full min-h-[120px] resize-none"
                />
            </div>
        </motion.div>
    );

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="h-full flex flex-col"
                    >
                        {/* Header */}
                        <DialogHeader className="px-6 py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-gray-800">
                                        Edit Load
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-500 mt-1">
                                        Update your load details
                                    </DialogDescription>
                                </div>
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 p-0 rounded-full"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </DialogHeader>

                        {/* Content */}
                        <div className="flex-1 px-6 py-5 overflow-y-auto">
                            {renderEditForm()}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 pb-20 border-t border-gray-200 bg-white space-y-3 md:space-y-0 md:flex md:justify-between md:items-center md:gap-4">
                            <Button
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="w-full md:w-auto order-2 md:order-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!isFormValid()}
                                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white order-1 md:order-2 shadow-md shadow-orange-500/30 disabled:bg-gray-300 disabled:shadow-none"
                            >
                                Update Load
                            </Button>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={showConfirmation}
                onOpenChange={setShowConfirmation}
                onConfirm={handleConfirmUpdate}
                loading={loading}
            />
        </>
    );
};

export default EditLoadModal;