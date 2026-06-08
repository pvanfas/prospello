import React from "react";
import useAuth from "../hooks/useAuth";
import DriverDashboard from "../components/Dashboard/DriverDashboard";
import ShipperDashboard from "../components/Dashboard/ShipperDashboard";
import ServiceProviderDashboard from "../components/Dashboard/ServiceProviderDashboard";

const Dashboard = () => {
    const { user } = useAuth();

    const getDashboardComponents = () => {
        if (user?.role === "driver") {
            return <DriverDashboard />;
        } else if (user?.role === "service_provider") {
            return <ServiceProviderDashboard />;
        } else {
            return <ShipperDashboard />
        }
    }

    return (
        <>
            {getDashboardComponents()}
        </>
    );
};

export default Dashboard;