import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import DriverProfilePage from "../components/Profile/DriverProfile";
import { h1 } from "framer-motion/client";
import ShipperProfile from "../components/Profile/ShipperProfile";
import BrokerProfile from "../components/Profile/BrokerProfile";
import ServiceProviderProfile from "../components/Profile/ServiceProviderProfile";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const handleLogout = async () => {
        try {
            // Stop all background tracking and Service Worker
            await stopAllTracking();
            
            // Call backend logout to revoke refresh token
            await api.post("/v1/auth/logout", {
                refresh_token: user?.refreshToken
            });
        } catch (error) {
            console.error("Logout error:", error);
            // Continue with logout even if backend call fails
        } finally {
            // Always clear frontend state
            dispatch(logout());
        }
    };

    // Function to stop all background tracking and Service Worker
    const stopAllTracking = async () => {
        try {
            // Stop Service Worker tracking
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'STOP_BACKGROUND_TRACKING'
                });
            }

            // Unregister all Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                    console.log('Service Worker unregistered on logout:', registration.scope);
                }
            }

            // Clear all tracking states from localStorage
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('tracking_')) {
                    localStorage.removeItem(key);
                }
            });

            console.log('All background tracking stopped on logout');
        } catch (error) {
            console.error('Error stopping tracking on logout:', error);
        }
    };
    // Implement your logout logic here
    const getComponent = () => {
        if (user.role === "driver") {
            return <DriverProfilePage />;
        } else if (user.role === "shipper") {
            return <ShipperProfile />;
        } else if (user.role === "broker") {
            return <BrokerProfile />;
        } else if (user.role === "service_provider") {
            return <ServiceProviderProfile />;
        } else {
            return <div>Unknown role</div>;
        }
    };

    const buttonVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" },
        },
    };

    return (
        <>
            <div>{user.role && getComponent()}</div>
            <div>
                <motion.button
                    className="w-full py-4 px-6 rounded-xl font-semibold text-red-600 bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
                    variants={buttonVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 m-4" />
                    <span>Log Out</span>
                </motion.button>
            </div>
        </>
    );
};

export default Profile;
