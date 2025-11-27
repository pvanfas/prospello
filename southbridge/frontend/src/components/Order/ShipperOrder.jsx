import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Package,
    Truck,
    Clock,
    User,
    IndianRupee,
    X,
    Check,
    AlertTriangle,
    Info,
    Phone,
    MapPin,
} from "lucide-react";
import api from "../../services/api";
import { combineReducers } from "@reduxjs/toolkit";

// Custom Alert Component
const Alert = ({ children, className = "", variant = "default" }) => {
    const baseClasses = "relative w-full rounded-lg border p-4";
    const variantClasses = {
        default: "bg-white border-gray-200 text-gray-900",
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {children}
        </div>
    );
};

const AlertDescription = ({ children, className = "" }) => (
    <div className={`text-sm ${className}`}>{children}</div>
);

// Custom Badge Component
const Badge = ({ children, variant = "default", style = {} }) => {
    const baseClasses =
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    const variantClasses = {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        error: "bg-red-100 text-red-800",
        warning: "bg-yellow-100 text-yellow-800",
        info: "bg-blue-100 text-blue-800",
    };

    return (
        <span
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={style}
        >
            {children}
        </span>
    );
};

// Custom Button Component
const Button = ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    ...props
}) => {
    const baseClasses =
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
        primary:
            "bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500",
        secondary:
            "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500",
        danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
        outline:
            "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-orange-500",
        success:
            "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "w-full py-3 text-sm",
    };

    return (
        <motion.button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

// Custom Card Component
const Card = ({ children, className = "" }) => (
    <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
        {children}
    </div>
);

const CardContent = ({ children, className = "" }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);

// Custom Modal Component
const Modal = ({ isOpen, onClose, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ModalContent = ({ children, className = "" }) => (
    <div className={`p-6 ${className}`}>{children}</div>
);

// Custom Toast Component
const Toast = ({ toast, onClose }) => (
    <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 left-4 right-4 z-50"
            >
                <Alert variant={toast.type} className="shadow-lg">
                    <div className="flex items-center">
                        {toast.type === "success" && (
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        )}
                        {toast.type === "error" && (
                            <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                        )}
                        {toast.type === "warning" && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                        )}
                        {toast.type === "info" && (
                            <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                        )}
                        <AlertDescription className="flex-1">
                            {toast.message}
                        </AlertDescription>
                        <button
                            onClick={onClose}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </Alert>
            </motion.div>
        )}
    </AnimatePresence>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const configs = {
            driver_accepted: { color: "#22C55E", text: "Driver Accepted" },
            pending: { color: "#FF6B35", text: "Pending" },
            driver_rejected: { color: "#EF4444", text: "Driver Rejected" },
            canceled: { color: "#EF4444", text: "Canceled" },
            picked_up: { color: "#3B82F6", text: "Picked Up" },
            in_transit: { color: "#3B82F6", text: "In Transit" },
            delivered: { color: "#9CA3AF", text: "Delivered" },
            completed: { color: "#9CA3AF", text: "Completed" },
        };
        return configs[status] || { color: "#9CA3AF", text: status };
    };

    const config = getStatusConfig(status);

    return (
        <Badge style={{ backgroundColor: config.color, color: "white" }}>
            {config.text}
        </Badge>
    );
};

// Order Card Component
const OrderCard = ({
    order,
    onMakePayment,
    onCancelOrder,
    onConfirmDelivery,
    onTrackOrder,
}) => {
    const getRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays}d ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours}h ago`;
        } else {
            return "Just now";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
            <Card>
                <CardContent>
                    {/* Top Row - Order Number + Status */}
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-800 text-sm">
                            {order.order_number}
                        </h3>
                        <StatusBadge status={order.status} />
                    </div>

                    {/* Route Row */}
                    <div className="flex items-center mb-3 text-sm">
                        <span className="text-gray-700 font-medium truncate flex-1">
                            {order.origin}
                        </span>
                        <ArrowRight className="mx-2 h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium truncate flex-1">
                            {order.destination}
                        </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                        <div className="flex items-center text-gray-500">
                            <Package className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                                {order.goods_type} • {order.weight}
                            </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{getRelativeTime(order.created_at)}</span>
                        </div>
                        {order.driver_name && (
                            <div className="flex items-center text-gray-700">
                                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="font-medium truncate">
                                    {order.driver_name}
                                </span>
                            </div>
                        )}
                        {order.driver_phone && (
                            <div className="flex items-center text-gray-700 justify-between">
                                <div className="flex items-center">
                                    <Truck className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="font-medium truncate">
                                        {order.driver_phone}
                                    </span>
                                </div>
                                <a href={`tel:${order.driver_phone}`}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-2 flex items-center"
                                    >
                                        <Phone className="h-4 w-4 mr-1" />
                                        Call
                                    </Button>
                                </a>
                            </div>
                        )}
                        <div className="flex items-center">
                            <IndianRupee className="h-3 w-3 mr-1 text-orange-500 flex-shrink-0" />
                            <span className="font-bold text-orange-500">
                                {(Number(order.amount) || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons - Different buttons for different statuses */}
                    {order.status === "driver_accepted" && (
                        <div className="space-y-2">
                            <Button
                                variant="primary"
                                size="xl"
                                onClick={() =>
                                    onMakePayment(order.order_number)
                                }
                            >
                                Make Payment
                            </Button>
                            <Button
                                variant="secondary"
                                size="xl"
                                onClick={() => onCancelOrder(order.id)}
                            >
                                Cancel Order
                            </Button>
                        </div>
                    )}

                    {/* Track Order Button - Show for in-transit, picked_up, delivered statuses */}
                    {["in_transit"].includes(order.status) && (
                        <div className="mb-2">
                            <Button
                                variant="outline"
                                size="xl"
                                onClick={() => onTrackOrder(order.id)}
                                className="w-full"
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                Track Order
                            </Button>
                        </div>
                    )}

                    {/* Confirm Delivery Button - Only for delivered status */}
                    {order.status === "delivered" && (
                        <div className="space-y-2">
                            <Button
                                variant="success"
                                size="xl"
                                onClick={() => onConfirmDelivery(order.id)}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Confirm Delivery
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Main Orders Page Component
const OrdersPage = () => {
    const navigate = useNavigate();
    const [showCancelModal, setShowCancelModal] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [orders, setOrders] = useState([]);

    const fetchData = async () => {
        try {
            const response = await api.get("/v1/order/my-orders");
            if (response.status === 200) {
                console.log(response.data,"---------------");

                setOrders(response.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleMakePayment = async (order) => {
        try {
            // 1. Create Razorpay Order via backend

            const res = await api.post("/v1/payment/create-order", {
                order_id: order.id,
                amount: parseFloat(order.amount), // ensure backend expects INR not paise
            });

            const { razorpay_order_id, amount, currency, payment_id } =
                res.data;

            // 2. Setup Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // frontend key
                amount: amount,
                currency: currency,
                name: "Logistics App",
                description: `Payment for Order ${order.order_number}`,
                order_id: razorpay_order_id,
                handler: async function (response) {
                    // 3. Verify payment with backend
                    try {
                        await api.post("/v1/payment/verify", {
                            payment_id: payment_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        showToast(
                            `Payment authorized for ${order.order_number}`
                        );
                        fetchData();
                    } catch (err) {
                        console.error(err);
                        showToast("Payment verification failed", "error");
                    }
                },
                prefill: {
                    name: order.customer_name || "Customer",
                    email: "test@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment error:", err);
            showToast("Could not initiate payment", "error");
        }
    };

    const handleCancelOrder = (orderId) => {
        setOrders(
            orders.map((order) =>
                order.id === orderId ? { ...order, status: "canceled" } : order
            )
        );
        setShowCancelModal(null);
        showToast("Order canceled successfully", "success");
    };

    const handleConfirmDelivery = async (orderId) => {
        try {
            // Make API call to confirm delivery

            const response = await api.post(`/v1/payment/capture/`, {
                order_id: orderId,
            });

            if (response.status === 200) {
                // Update the order status to completed
                setOrders(
                    orders.map((order) =>
                        order.id === orderId
                            ? { ...order, status: "completed" }
                            : order
                    )
                );
                setShowConfirmModal(null);
                showToast("Delivery confirmed successfully!", "success");
            }
        } catch (error) {
            console.error("Error confirming delivery:", error);
            showToast("Failed to confirm delivery. Please try again.", "error");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
                <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {orders.length} orders found
                </p>
            </div>

            {/* Orders List */}
            <motion.div
                className="px-4 mt-4 space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {orders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onMakePayment={() => handleMakePayment(order)}
                        onCancelOrder={setShowCancelModal}
                        onConfirmDelivery={setShowConfirmModal}
                        onTrackOrder={(orderId) =>
                            navigate(`/track-order/${orderId}`)
                        }
                    />
                ))}
            </motion.div>

            {/* Cancel Confirmation Modal */}
            <Modal
                isOpen={!!showCancelModal}
                onClose={() => setShowCancelModal(null)}
            >
                <ModalContent className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                        <X className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Cancel Order
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to cancel this order? This action
                        cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => setShowCancelModal(null)}
                            className="flex-1"
                        >
                            Keep Order
                        </Button>
                        <Button
                            variant="danger"
                            size="lg"
                            onClick={() => handleCancelOrder(showCancelModal)}
                            className="flex-1"
                        >
                            Cancel Order
                        </Button>
                    </div>
                </ModalContent>
            </Modal>

            {/* Confirm Delivery Modal */}
            <Modal
                isOpen={!!showConfirmModal}
                onClose={() => setShowConfirmModal(null)}
            >
                <ModalContent className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                        <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Confirm Delivery
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Please confirm that you have received your order in good
                        condition. This will mark the order as completed.
                    </p>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => setShowConfirmModal(null)}
                            className="flex-1"
                        >
                            Not Yet
                        </Button>
                        <Button
                            variant="success"
                            size="lg"
                            onClick={() =>
                                handleConfirmDelivery(showConfirmModal)
                            }
                            className="flex-1"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Confirm
                        </Button>
                    </div>
                </ModalContent>
            </Modal>

            {/* Toast Notification */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

export default OrdersPage;
