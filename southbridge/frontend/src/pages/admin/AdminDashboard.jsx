import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import { LogOut, Users, Truck, Package, BarChart3, Menu, Activity, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "../../components/Admin/Sidebar";
import Broker from "./Broker";
import Driver from "./Driver";
import Shipper from "./Shipper";
import Load from "./Load";
import Service from "./Service";
import Order from "./Order";
import Payment from "./Payment";
import { getRecentActivities, getActivityStats, ActivityCreators } from "../../services/activityTracker";
import { getBrokers, getDrivers, getShippers, getLoads, getDashboardStats } from "../../services/adminApi";

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [dashboardStats, setDashboardStats] = useState({
        totalBrokers: 0,
        totalDrivers: 0,
        totalShippers: 0,
        totalLoads: 0,
        activeLoads: 0,
        completedLoads: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [activityStats, setActivityStats] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Track admin login
                ActivityCreators.userLogin(user?.username || 'Admin');
                
                // Fetch dashboard statistics from the new endpoint
                const stats = await getDashboardStats();

                setDashboardStats({
                    totalBrokers: stats.total_brokers,
                    totalDrivers: stats.total_drivers,
                    totalShippers: stats.total_shippers,
                    totalLoads: stats.total_loads,
                    activeLoads: stats.active_loads,
                    completedLoads: stats.completed_loads,
                    totalOrders: stats.total_orders,
                    totalRevenue: 0 // Not tracked in current model
                });

                // Get recent activities
                setRecentActivities(getRecentActivities(10));
                setActivityStats(getActivityStats());

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (activeItem === 'Dashboard') {
            fetchDashboardData();
        }
    }, [activeItem, user]);

    const handleLogout = async () => {
        // Track logout activity
        ActivityCreators.userLogout(user?.username || 'Admin');
        dispatch(logout());
    };

    const handleNavigation = (itemName) => {
        setActiveItem(itemName);
    };

    const renderActiveComponent = () => {
        switch (activeItem) {
            case 'Dashboard':
                return (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                                >
                                    <div className="flex items-center">
                                        <div className={`p-3 rounded-lg ${stat.color}`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                                    <h3 className="font-medium text-gray-900">Manage Users</h3>
                                    <p className="text-sm text-gray-600">
                                        View and manage user accounts
                                    </p>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                                >
                                    <Truck className="h-8 w-8 text-green-500 mb-2" />
                                    <h3 className="font-medium text-gray-900">Driver Management</h3>
                                    <p className="text-sm text-gray-600">
                                        Manage driver profiles and verification
                                    </p>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <Package className="h-8 w-8 text-purple-500 mb-2" />
                                    <h3 className="font-medium text-gray-900">Load Management</h3>
                                    <p className="text-sm text-gray-600">
                                        Monitor and manage load postings
                                    </p>
                                </motion.button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Recent Activity
                                </h2>
                                <div className="text-sm text-gray-500">
                                    {activityStats.total || 0} total activities
                                </div>
                            </div>
                            
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : recentActivities.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No recent activities</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${
                                                activity.severity === 'success' ? 'bg-green-500' :
                                                activity.severity === 'warning' ? 'bg-yellow-500' :
                                                activity.severity === 'error' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {activity.user}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Activity Statistics */}
                        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Activity Statistics
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-blue-600">
                                        {activityStats.bySeverity?.success || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Success</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {activityStats.bySeverity?.warning || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Warnings</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-red-600">
                                        {activityStats.bySeverity?.error || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Errors</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-600">
                                        {activityStats.lastHour || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Last Hour</div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'Broker':
                return <Broker />;
            case 'Driver':
                return <Driver />;
            case 'Shipper':
                return <Shipper />;
            case 'Load':
                return <Load />;
            case 'Service':
                return <Service />;
            case 'Order':
                return <Order />;
            case 'Payment':
                return <Payment />;
            default:
                return <div>Page not found</div>;
        }
    };

    const stats = [
        {
            title: "Total Brokers",
            value: loading ? "..." : dashboardStats.totalBrokers.toString(),
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Total Drivers",
            value: loading ? "..." : dashboardStats.totalDrivers.toString(),
            icon: Truck,
            color: "bg-green-500",
        },
        {
            title: "Total Loads",
            value: loading ? "..." : dashboardStats.totalLoads.toString(),
            icon: Package,
            color: "bg-purple-500",
        },
        {
            title: "Active Loads",
            value: loading ? "..." : dashboardStats.activeLoads.toString(),
            icon: TrendingUp,
            color: "bg-orange-500",
        },
    ];

    const buttonVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" },
        },
    };

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activeItem={activeItem}
                onNavigation={handleNavigation}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-700"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">{activeItem}</h2>
                            <p className="text-xs text-slate-500">Current page</p>
                        </div>
                        <div className="ml-auto">
                            <motion.button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                variants={buttonVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </motion.button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <motion.div
                        key={activeItem}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto"
                    >
                        {renderActiveComponent()}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
