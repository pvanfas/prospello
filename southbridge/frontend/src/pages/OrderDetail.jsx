import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    Package,
    Calendar,
    Clock,
    DollarSign,
    Truck,
    User,
    Phone,
    CheckCircle,
    AlertCircle,
    Navigation,
    FileText,
    Tag,
    Weight,
    Ruler,
    Image as ImageIcon,
} from "lucide-react";
import api from "../services/api";
import Loader from "../components/Loader";

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/v1/order/${orderId}/detail`);
            setOrder(response.data);
        } catch (error) {
            console.error("Error fetching order details:", error);
            setError("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            bid_accepted: {
                text: "Bid Accepted",
                color: "bg-blue-500",
                icon: CheckCircle,
            },
            driver_accepted: {
                text: "Accepted",
                color: "bg-green-500",
                icon: CheckCircle,
            },
            picked_up: {
                text: "Picked Up",
                color: "bg-purple-500",
                icon: Package,
            },
            in_transit: {
                text: "In Transit",
                color: "bg-orange-500",
                icon: Truck,
            },
            delivered: {
                text: "Delivered",
                color: "bg-teal-500",
                icon: CheckCircle,
            },
            completed: {
                text: "Completed",
                color: "bg-green-600",
                icon: CheckCircle,
            },
            canceled: {
                text: "Canceled",
                color: "bg-red-500",
                icon: AlertCircle,
            },
        };
        return configs[status] || configs.bid_accepted;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading) {
        return <Loader />;
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Error Loading Order
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">
                                {order.order_number}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Order Details
                            </p>
                        </div>
                        <span
                            className={`${statusConfig.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}
                        >
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusConfig.text}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Order Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Order Timeline
                    </h2>
                    <div className="space-y-3">
                        {order.created_at && (
                            <TimelineItem
                                label="Order Created"
                                time={formatDateTime(order.created_at)}
                                active={true}
                            />
                        )}
                        {order.bid_accepted_at && (
                            <TimelineItem
                                label="Bid Accepted"
                                time={formatDateTime(order.bid_accepted_at)}
                                active={true}
                            />
                        )}
                        {order.driver_accepted_at && (
                            <TimelineItem
                                label="Driver Accepted"
                                time={formatDateTime(order.driver_accepted_at)}
                                active={true}
                            />
                        )}
                        {order.picked_up_at && (
                            <TimelineItem
                                label="Picked Up"
                                time={formatDateTime(order.picked_up_at)}
                                active={true}
                            />
                        )}
                        {order.in_transit_at && (
                            <TimelineItem
                                label="In Transit"
                                time={formatDateTime(order.in_transit_at)}
                                active={true}
                            />
                        )}
                        {order.delivered_at && (
                            <TimelineItem
                                label="Delivered"
                                time={formatDateTime(order.delivered_at)}
                                active={true}
                            />
                        )}
                        {order.completed_at && (
                            <TimelineItem
                                label="Completed"
                                time={formatDateTime(order.completed_at)}
                                active={true}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Load Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
                >
                    <h2 className="text-xl font-bold mb-4">Load Details</h2>

                    {/* Route */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-start space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg mt-1">
                                <MapPin className="w-5 h-5 text-green-300" />
                            </div>
                            <div>
                                <p className="text-orange-100 text-xs">
                                    Origin
                                </p>
                                <p className="font-semibold text-lg">
                                    {order.load.origin}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="border-l-2 border-dashed border-white border-opacity-30 h-8"></div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg mt-1">
                                <MapPin className="w-5 h-5 text-red-300" />
                            </div>
                            <div>
                                <p className="text-orange-100 text-xs">
                                    Destination
                                </p>
                                <p className="font-semibold text-lg">
                                    {order.load.destination}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Load Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white bg-opacity-10 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                                <Package className="w-4 h-4 text-orange-200" />
                                <p className="text-orange-100 text-xs">
                                    Goods Type
                                </p>
                            </div>
                            <p className="font-semibold">
                                {order.load.goods_type}
                            </p>
                        </div>

                        <div className="bg-white bg-opacity-10 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                                <Weight className="w-4 h-4 text-orange-200" />
                                <p className="text-orange-100 text-xs">
                                    Weight
                                </p>
                            </div>
                            <p className="font-semibold">{order.load.weight}</p>
                        </div>

                        {order.load.dimensions && (
                            <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Ruler className="w-4 h-4 text-orange-200" />
                                    <p className="text-orange-100 text-xs">
                                        Dimensions
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    {order.load.dimensions}
                                </p>
                            </div>
                        )}

                        {order.load.category && (
                            <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Tag className="w-4 h-4 text-orange-200" />
                                    <p className="text-orange-100 text-xs">
                                        Category
                                    </p>
                                </div>
                                <p className="font-semibold capitalize">
                                    {order.load.category.replace("_", " ")}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Special Instructions */}
                    {order.load.special_instructions && (
                        <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <FileText className="w-4 h-4 text-orange-200" />
                                <p className="text-orange-100 text-sm font-medium">
                                    Special Instructions
                                </p>
                            </div>
                            <p className="text-sm">
                                {order.load.special_instructions}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Bid Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Bid Information
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Bid Amount</p>
                            <p className="text-3xl font-bold text-green-600">
                                ₹{order.bid.amount}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Bid Status</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                                {order.bid.status?.replace("_", " ")}
                            </p>
                            {order.bid.created_at && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatDate(order.bid.created_at)}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Driver Information */}
                {order.driver.id && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Driver Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-orange-100 p-3 rounded-full">
                                        <User className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {order.driver.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Driver
                                        </p>
                                    </div>
                                </div>
                                {order.driver.phone && (
                                    <a
                                        href={`tel:${order.driver.phone}`}
                                        className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                                    >
                                        <Phone className="w-5 h-5" />
                                    </a>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {order.driver.vehicle_type && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Truck className="w-4 h-4 text-gray-500" />
                                            <p className="text-xs text-gray-500">
                                                Vehicle Type
                                            </p>
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {order.driver.vehicle_type}
                                        </p>
                                    </div>
                                )}

                                {order.driver.vehicle_number && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Tag className="w-4 h-4 text-gray-500" />
                                            <p className="text-xs text-gray-500">
                                                Vehicle Number
                                            </p>
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {order.driver.vehicle_number}
                                        </p>
                                    </div>
                                )}

                                {order.driver.vehicle_capacity && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Weight className="w-4 h-4 text-gray-500" />
                                            <p className="text-xs text-gray-500">
                                                Capacity
                                            </p>
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {order.driver.vehicle_capacity}
                                        </p>
                                    </div>
                                )}

                                {order.driver.status && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <CheckCircle className="w-4 h-4 text-gray-500" />
                                            <p className="text-xs text-gray-500">
                                                Status
                                            </p>
                                        </div>
                                        <p className="font-medium text-gray-900 capitalize">
                                            {order.driver.status.replace(
                                                "_",
                                                " "
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Owner Information */}
                {order.owner.name && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            {order.owner.type} Information
                        </h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {order.owner.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.owner.type}
                                    </p>
                                </div>
                            </div>
                            {order.owner.phone && (
                                <a
                                    href={`tel:${order.owner.phone}`}
                                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Load Image */}
                {order.load.image_url && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Load Image
                        </h2>
                        <img
                            src={order.load.image_url}
                            alt="Load"
                            className="w-full rounded-lg"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Timeline Item Component
const TimelineItem = ({ label, time, active }) => {
    return (
        <div className="flex items-start space-x-3">
            <div
                className={`${
                    active ? "bg-orange-500" : "bg-gray-300"
                } w-3 h-3 rounded-full mt-1.5`}
            ></div>
            <div className="flex-1">
                <p
                    className={`font-medium ${
                        active ? "text-gray-900" : "text-gray-400"
                    }`}
                >
                    {label}
                </p>
                <p className="text-sm text-gray-500">{time}</p>
            </div>
        </div>
    );
};

export default OrderDetail;

