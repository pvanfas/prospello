import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Package,
    MapPin,
    Clock,
    ChevronDown,
    Timer,
    Link as LinkIcon,
    Truck,
    Tractor,
    TractorIcon,
    User,
    Search,
    Gavel,
} from "lucide-react";
import api from "../../services/api";
import { table } from "framer-motion/client";
import { useToast } from "../Toast";
import { Link } from "react-router-dom";

const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
};

const useTimer = (expiresAt, bidAcceptedAt) => {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [timerColor, setTimerColor] = useState("green");

    useEffect(() => {
        if (!expiresAt || !bidAcceptedAt) return;

        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const expiryTime = new Date(expiresAt).getTime();
            const timeDiff = expiryTime - now;

            if (timeDiff <= 0) {
                setTimeRemaining("Expired");
                setTimerColor("red");
                return;
            }

            const totalMinutes = Math.floor(timeDiff / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            // Color logic based on remaining time
            if (totalMinutes < 10) {
                setTimerColor("red");
            } else if (totalMinutes <= 20) {
                setTimerColor("warning");
            } else {
                setTimerColor("green");
            }

            // Format time display
            let timeDisplay = "";
            if (hours > 0) {
                if (minutes > 0) {
                    timeDisplay = `${hours}h ${minutes}min left`;
                } else {
                    timeDisplay = `${hours}h left`;
                }
            } else {
                timeDisplay = `${minutes}min left`;
            }

            setTimeRemaining(timeDisplay);
        };

        // Calculate immediately
        calculateTimeRemaining();

        // Update every second
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, bidAcceptedAt]);

    return { timeRemaining, timerColor };
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const { showToast } = useToast();

    const fetchOrders = async () => {
        try {
            const response = await api.get("/v1/order/driver/");
            if (response.status === 200) {
                console.log("orders", response.data);
                
                setOrders(response.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                color: "bg-orange-500",
                text: "Pending",
                textColor: "text-white",
            },
            bid_accepted: {
                color: "bg-green-500",
                text: "Bid Accepted",
                textColor: "text-white",
            },
            driver_accepted: {
                color: "bg-green-500",
                text: "Driver Accepted",
                textColor: "text-white",
            },
            driver_rejected: {
                color: "bg-red-500",
                text: "Driver Rejected",
                textColor: "text-white",
            },
            canceled: {
                color: "bg-red-500",
                text: "Canceled",
                textColor: "text-white",
            },
            picked_up: {
                color: "bg-blue-500",
                text: "Picked Up",
                textColor: "text-white",
            },
            in_transit: {
                color: "bg-blue-500",
                text: "In Transit",
                textColor: "text-white",
            },
            delivered: {
                color: "bg-gray-500",
                text: "Delivered",
                textColor: "text-white",
            },
            completed: {
                color: "bg-green-500",
                text: "Completed",
                textColor: "text-white",
            },
            expired: {
                color: "bg-gray-600",
                text: "Expired",
                textColor: "text-white",
            },
        };
        return configs[status] || configs.pending;
    };

    const getTimerColorClass = (color) => {
        const colors = {
            red: "text-red-600 bg-red-50 border-red-200",
            warning: "text-orange-600 bg-orange-50 border-orange-200",
            green: "text-green-600 bg-green-50 border-green-200",
        };
        return colors[color] || colors.green;
    };

    const handleAccept = async (orderId) => {
        try {
            // Call API to accept the order
            const response = await api.post(`/v1/order/${orderId}/accept/`);

            if (response.status === 200) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, status: "driver_accepted" }
                            : order
                    )
                );
            }
        } catch (error) {
            console.error("Error accepting order:", error);
            // You might want to show a toast notification here
        }
    };

    const handleDecline = async (orderId) => {
        try {
            // Call API to decline the order
            const response = await api.post(
                `/v1/driver/orders/${orderId}/decline/`
            );

            if (response.status === 200) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, status: "driver_rejected" }
                            : order
                    )
                );
            }
        } catch (error) {
            console.error("Error declining order:", error);
            // You might want to show a toast notification here
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Call API to update order status
            const response = await api.post(`/v1/order/${orderId}/status/`, {
                status: newStatus,
            });

            if (response.status === 200) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
                showToast("success", `Order status updated to ${newStatus}`);
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            // You might want to show a toast notification here
        }
    };

    const isOrderExpired = (order) => {
        // Only check expiry time for orders with BID_ACCEPTED status
        if (order.status !== "bid_accepted") return false;
        
        // Check if order is expired based on timer logic
        if (!order.expires_at || !order.bid_accepted_at) return false;
        
        const now = new Date().getTime();
        const expiryTime = new Date(order.expires_at).getTime();
        return now > expiryTime;
    };

    const getAvailableStatuses = (currentStatus, order) => {
        // If order is expired, return empty array (no status changes allowed)
        if (isOrderExpired(order)) {
            return [];
        }
        
        // Define which statuses can be changed to based on current status
        if (currentStatus === "bid_accepted") {
            return [
                { value: "in_transit", label: "In Transit" },
                { value: "delivered", label: "Delivered" },
                { value: "canceled", label: "Canceled" },
                { value: "picked_up", label: "Picked Up" },
            ];
        }
        if (currentStatus === "driver_accepted") {
            return []; // No status changes allowed for driver_accepted
        }
        if (currentStatus === "in_transit") {
            return [
                { value: "delivered", label: "Delivered" },
                { value: "canceled", label: "Canceled" },
                { value: "picked_up", label: "Picked Up" },
            ];
        }
        if (currentStatus === "picked_up") {
            return [
                { value: "delivered", label: "Delivered" },
                { value: "canceled", label: "Canceled" },
            ];
        }
        if (currentStatus === "canceled") {
            return [];
        }
        if (currentStatus === "pending") {
            return [
                { value: "in_transit", label: "In Transit" },
                { value: "delivered", label: "Delivered" },
                { value: "canceled", label: "Canceled" },
                { value: "picked_up", label: "Picked Up" },
            ];
        } else {
            return [];
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

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 50,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        },
    };

    const TimerComponent = ({ expiresAt, bidAcceptedAt }) => {
        const { timeRemaining, timerColor } = useTimer(
            expiresAt,
            bidAcceptedAt
        );

        if (!timeRemaining) return null;

        return (
            <div
                className={`flex items-center px-3 py-2 rounded-lg border ${getTimerColorClass(
                    timerColor
                )}`}
            >
                <Timer className="w-4 h-4 mr-2" />
                <div>
                    <p className="text-xs font-medium">Time Remaining</p>
                    <p className="text-sm font-bold">{timeRemaining}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-6 mb-19">
            {/* Quick Actions */}
            <motion.div
                className="px-4 pt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-orange-200 cursor-pointer"
                        aria-label="Book a Service"
                        onClick={() => window.location.assign('/book-service')}
                    >
                        <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Book a Service</p>
                            <p className="text-xs text-gray-500">Create a new service request</p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-orange-200"
                        aria-label="Find a Service"
                    >
                        <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                            <Search className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Find a Service</p>
                            <p className="text-xs text-gray-500">Browse available services</p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-orange-200"
                        aria-label="Progress of Service"
                    >
                        <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Progress of Service</p>
                            <p className="text-xs text-gray-500">Track current service status</p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-orange-200"
                        aria-label="Bids"
                    >
                        <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                            <Gavel className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Bids</p>
                            <p className="text-xs text-gray-500">View and manage your bids</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            {/* <motion.div
                className="px-4 pt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Link
                    to="/route"
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors"
                >
                    Route
                </Link>
            </motion.div>  */}
            <motion.div
                className="px-4 pt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {orders.map((order) => {
                    // Check if order is expired and override status if needed
                    const isExpired = isOrderExpired(order);
                    const displayStatus = isExpired ? "expired" : order.status;
                    const statusConfig = getStatusConfig(displayStatus);
                    const availableStatuses = getAvailableStatuses(
                        order.status,
                        order
                    );

                    return (
                        <motion.div
                            key={order.id}
                            variants={cardVariants}
                            className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-100"
                        >
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {order.order_number}
                                </h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.textColor}`}
                                >
                                    {statusConfig.text}
                                </span>
                            </div>

                            {/* Timer for bid_accepted orders */}
                            {order.status === "bid_accepted" &&
                                order.expires_at &&
                                order.bid_accepted_at && (
                                    <div className="mb-4">
                                        <TimerComponent
                                            expiresAt={order.expires_at}
                                            bidAcceptedAt={
                                                order.bid_accepted_at
                                            }
                                        />
                                    </div>
                                )}

                            {/* Expired message */}
                            {isExpired && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <Timer className="w-4 h-4 text-red-600 mr-2" />
                                        <p className="text-red-600 font-medium text-sm">
                                            This order has expired and cannot be modified
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Route */}
                            <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
                                <MapPin className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
                                <div className="flex items-center flex-1 min-w-0">
                                    <span className="text-gray-700 font-medium truncate">
                                        {order.load_origin_place || order.load_origin}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 mx-3 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium truncate">
                                        {order.load_destination_place || order.load_destination}
                                    </span>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center">
                                    <Package className="w-4 h-4 text-gray-500 mr-2" />
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Weight
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {order.load_weight}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        Bid Price
                                    </p>
                                    <p className="text-xl font-bold text-orange-500">
                                        ₹{order.bid_price}
                                    </p>
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="flex items-center mb-4">
                                <Clock className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                    {formatDateTime(order.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center mb-4">
                                <User className="w-4 h-4 text-gray-500 mr-2" />
                                <span className="text-xs text-gray-500">
                                    {order.load_owner_name}
                                </span>
                                <span onClick={() => {
                                    window.open(`tel:${order.load_owner_phone}`, '_blank');
                                }} className="text-xs text-gray-500">
                                    {" + 91 "}{order.load_owner_phone}
                                </span>
                            </div>

                            {/* Action Buttons for bid_accepted status - hide if expired */}
                            {order.status === "bid_accepted" && !isExpired && (
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleDecline(order.id)}
                                        className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors duration-200 active:bg-red-700"
                                    >
                                        Decline
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAccept(order.id)}
                                        className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors duration-200 active:bg-green-700"
                                    >
                                        Accept
                                    </motion.button>
                                </div>
                            )}
                            

                            {/* Status Dropdown - hide for bid_accepted and driver_accepted status */}
                            {order.status != "bid_accepted" &&
                                order.status != "driver_accepted" &&
                                availableStatuses.length > 0 &&
                                !isExpired && (
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Update Order Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    if (!newValue) return;
                                                    handleStatusChange(order.id, newValue);
                                                    // Reset to placeholder so the same choice can be re-selected if API fails
                                                    e.target.value = "";
                                                }}
                                                className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>
                                                    Select new status...
                                                </option>
                                                {availableStatuses.map(
                                                    (status) => (
                                                        <option
                                                            key={status.value}
                                                            value={status.value}
                                                        >
                                                            {status.label}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            
                            {/* Navigate Button for pending orders */}
                            {order.status === "pending" && (
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${order.load_origin_lat},${order.load_origin_long}`;
                                        window.open(mapsUrl, '_blank');
                                    }}
                                    className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors duration-200 active:bg-blue-700 flex items-center justify-center gap-2 mt-6"
                                >
                                    <MapPin className="w-5 h-5" />
                                    Navigate to Pickup Location
                                </motion.button>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default OrdersPage;
