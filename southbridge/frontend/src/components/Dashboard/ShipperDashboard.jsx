import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Package,
    MapPin,
    Clock,
    Truck,
    Plus,
    TrendingUp,
    Users,
    Building2
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../Toast";
import { Link } from "react-router-dom";

const ShipperDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0
    });
    const { showToast } = useToast();

    const fetchOrders = async () => {
        try {
            const response = await api.get("/v1/order/shipper/");
            if (response.status === 200) {
                setOrders(response.data);
                setStats({
                    totalOrders: response.data.length,
                    activeOrders: response.data.filter(order => order.status === 'active').length,
                    completedOrders: response.data.filter(order => order.status === 'completed').length
                });
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

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
        hidden: { opacity: 0, y: 50, scale: 0.95 },
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

    return (
        <div className="min-h-screen bg-gray-50 pb-6 mb-19">
            <motion.div
                className="px-4 pt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={cardVariants} className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipper Dashboard</h1>
                    <p className="text-gray-600">Manage your shipments and track deliveries</p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={cardVariants} className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-orange-500">{stats.activeOrders}</p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-500">{stats.completedOrders}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={cardVariants} className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            to="/load"
                            className="bg-orange-500 text-white p-4 rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Load
                        </Link>
                        <Link
                            to="/orders"
                            className="bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            View Orders
                        </Link>
                    </div>
                </motion.div>

                {/* Recent Orders */}
                <motion.div variants={cardVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link
                            to="/orders"
                            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                        >
                            View All
                        </Link>
                    </div>
                    
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-600 mb-4">Create your first shipment to get started</p>
                            <Link
                                to="/load"
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Create Load
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, 3).map((order) => (
                                <motion.div
                                    key={order.id}
                                    variants={cardVariants}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            order.status === 'active' ? 'bg-orange-100 text-orange-800' :
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {order.pickup_location} → {order.delivery_location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ShipperDashboard;


