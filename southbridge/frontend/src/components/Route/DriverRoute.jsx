import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    X,
    Check,
    AlertCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import api from "../../services/api";
import { div } from "framer-motion/client";
import { useNavigate } from "react-router-dom";

const CreateRoutePage = () => {
    const [activeTab, setActiveTab] = useState("Active");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
    const [availableOrders, setAvailableOrders] = useState([]);
    const navigate = useNavigate();
    const constraintsRef = useRef(null);

    // Sample data
    const [routes, setRoutes] = useState({
        Active: [],
        Completed: [],
        Canceled: [],
    });
    const fetchOrders = async () => {
        // Fetch orders available for route creation from backend
        try {
            const response = await api.get("/v1/order/route");
            console.log("Available orders for route creation:", response.data);
            setAvailableOrders(response.data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            // Set empty array on error to show empty state instead of breaking UI
            setAvailableOrders([]);
        }
    };

    const fetchRoutes = async () => {
        // Fetch routes from API - backend returns grouped by status
        try {
            const response = await api.get("/v1/route/");
            console.log("Fetched routes:", response.data);
            // Backend returns: { active: [...], completed: [...], cancelled: [...] }
            // Map to match frontend structure
            const groupedRoutes = {
                Active: response.data.active || [],
                Completed: response.data.completed || [],
                Canceled: response.data.cancelled || [],
            };
            setRoutes(groupedRoutes);
        } catch (error) {
            console.error("Error fetching routes:", error);
            // Set empty arrays on error
            setRoutes({
                Active: [],
                Completed: [],
                Canceled: [],
            });
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchRoutes();
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        auto_location: false,
        selected_orders: [], // Will store orders as {id: number} objects
    });
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);

    // Available orders for selection

    const tabs = ["Active", "Completed", "Canceled"];

    const handleOrderToggle = (order) => {
        setFormData((prev) => ({
            ...prev,
            selected_orders: prev.selected_orders.some(item => item.id === order.id)
                ? prev.selected_orders.filter(item => item.id !== order.id)
                : [...prev.selected_orders, { id: order.id }],
        }));
    };

    // Removed manual save route (start/end); always use current location flow

    const handleCreateRouteFromCurrent = async () => {
        try {
            const orderIds = formData.selected_orders.map(o => o.id);
            if (orderIds.length === 0) {
                alert("Please select at least one order");
                return;
            }

            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                        const payload = {
                            current_lat: latitude,
                            current_lng: longitude,
                            order_ids: orderIds,
                            name: formData.name || "Multi-drop route",
                            description: formData.description || undefined,
                        };
                        const response = await api.post("/v1/route/create-from-current/", payload);
                        console.log("Created route from current:", response.data);

                        // refresh routes
                        await fetchRoutes();

                        // reset and close modal
                        setFormData({
                            name: "",
                            description: "",
                            start_location: "",
                            end_location: "",
                            auto_location: false,
                            selected_orders: [],
                        });
                        setIsModalOpen(false);
                        setIsOrderDropdownOpen(false);
                    } catch (err) {
                        console.error("Error creating route from current:", err);
                        alert(err?.response?.data?.detail || "Failed to create route");
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Unable to get current location. Please allow location access.");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } catch (e) {
            console.error(e);
        }
    };

    const handleCompleteRoute = (routeId) => {
        const route = routes.Active.find((r) => r.id === routeId);
        if (route) {
            setRoutes((prev) => ({
                ...prev,
                Active: prev.Active.filter((r) => r.id !== routeId),
                Completed: [...prev.Completed, route],
            }));
        }
    };

    const handleDragEnd = (event, info) => {
        if (info.offset.y > 150) {
            setIsModalOpen(false);
        }
    };

    const RouteCard = ({ route, status }) => {
        const cardVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        };

        const getStatusIcon = () => {
            switch (status) {
                case "Completed":
                    return <Check className="w-5 h-5 text-green-500" />;
                case "Canceled":
                    return <X className="w-5 h-5 text-red-500" />;
                default:
                    return null;
            }
        };

        const getCardStyle = () => {
            switch (status) {
                case "Completed":
                    return "bg-green-50 border-green-200";
                case "Canceled":
                    return "bg-red-50 border-red-200";
                default:
                    return "bg-white border-gray-200";
            }
        };

        return (
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={`p-4 rounded-xl border shadow-sm mb-3 ${getCardStyle()}`}
            >
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                        {route.name}
                    </h3>
                    {getStatusIcon()}
                </div>

                {route.description && (
                    <p className="text-sm text-gray-500 mb-3">{route.description}</p>
                )}

                <div className="text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Origin:</span>
                        <span className="font-medium">
                            {route.origin?.lat?.toFixed(4)}, {route.origin?.lng?.toFixed(4)}
                        </span>
                    </div>
                    {route.destination_count > 0 && (
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">Destinations:</span>
                            <span className="font-medium">{route.destination_count} stops</span>
                        </div>
                    )}
                    {route.eta_minutes && (
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">ETA:</span>
                            <span className="font-medium">{Math.round(route.eta_minutes)} min</span>
                        </div>
                    )}
                </div>

                {route.order_count > 0 && (
                    <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                            Orders: {route.order_count}
                        </p>
                        <div className="space-y-1">
                            {route.orders && route.orders.slice(0, 3).map((order, idx) => (
                                <div
                                    key={idx}
                                    className="text-xs bg-gray-100 px-2 py-1 rounded-lg"
                                >
                                    <span className="font-medium text-orange-600">
                                        {order.order_number}
                                    </span>
                                </div>
                            ))}
                            {route.order_count > 3 && (
                                <div className="text-xs text-gray-500 px-2">
                                    +{route.order_count - 3} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {status === "Active" && (
                  <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { navigate(`/route/${route.id}`) }}
                        className="w-1/2 bg-gray-500 text-white py-2 px-4 rounded-xl font-medium text-sm hover:bg-gray-600 transition-colors"
                    >
                        View Details
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCompleteRoute(route.id)}
                        className="w-1/2 bg-orange-500 text-white py-2 px-4 rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors"
                    >
                        Mark Complete
                    </motion.button>
                  </div>
                    
                )}
                {status !== "Active" && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { navigate(`/route/${route.id}`) }}
                        className="w-full bg-gray-500 text-white py-2 px-4 rounded-xl font-medium text-sm hover:bg-gray-600 transition-colors"
                    >
                        View Details
                    </motion.button>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 mb-20" ref={constraintsRef}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="bg-orange-500 text-white p-3 rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Sticky Tab Bar */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
                <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab
                                    ? "bg-white text-orange-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {tab} ({routes[tab].length})
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Route Content */}
            <div className="px-4 py-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {routes[activeTab].length > 0 ? (
                            routes[activeTab].map((route) => (
                                <RouteCard
                                    key={route.id}
                                    route={route}
                                    status={activeTab}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    No {activeTab.toLowerCase()} routes
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Sheet Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300,
                            }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
                        >
                            {/* Drag Handle */}
                            <div className="flex justify-center py-3 border-b border-gray-200">
                                <div className="w-12 h-1 bg-gray-300 rounded-full" />
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[70vh]">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Add New Route
                                    </h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Route Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Route Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter route name"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                            placeholder="Enter route description"
                                        />
                                    </div>

                                    {/* Using device location automatically as origin */}

                                    {/* Auto Location Toggle */}
                                    

                                    {/* Order Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Orders
                                        </label>
                                        <button
                                            onClick={() =>
                                                setIsOrderDropdownOpen(
                                                    !isOrderDropdownOpen
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center justify-between"
                                        >
                                            <span className="text-gray-600">
                                                {
                                                    formData.selected_orders
                                                        .length
                                                }{" "}
                                                orders selected
                                            </span>
                                            {isOrderDropdownOpen ? (
                                                <ChevronUp className="w-5 h-5" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5" />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {isOrderDropdownOpen && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="mt-2 border border-gray-300 rounded-xl overflow-hidden"
                                                >
                                                    <div className="max-h-40 overflow-y-auto">
                                                        {availableOrders.length > 0 ? (
                                                            availableOrders.map(
                                                                (order) => (
                                                                    <label
                                                                        key={
                                                                            order.order_number
                                                                        }
                                                                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.selected_orders.some(item => item.id === order.id)}
                                                                            onChange={() =>
                                                                                handleOrderToggle(
                                                                                    order
                                                                                )
                                                                            }
                                                                            className="mr-3 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="font-medium text-orange-600 text-sm">
                                                                                {
                                                                                    order.order_number
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-gray-600">
                                                                                {
                                                                                    order.origin
                                                                                }{" "}
                                                                                →{" "}
                                                                                {
                                                                                    order.destination
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                )
                                                            )
                                                        ) : (
                                                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                                                No orders available for route creation.
                                                                <br />
                                                                <span className="text-xs text-gray-400">
                                                                    Orders must be accepted and not already in a route.
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Primary Action */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCreateRouteFromCurrent}
                                        disabled={!formData.name || formData.selected_orders.length === 0}
                                        className="w-full bg-orange-500 mb-28 text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                    >
                                        Create From Current Location
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateRoutePage;
