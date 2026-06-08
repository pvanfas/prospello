import React from "react";
import { Routes, Route } from "react-router-dom";
import ServiceProviderBooking from "../pages/ServiceProviderBooking";
import ServiceProviderProfile from "../components/Profile/ServiceProviderProfile";
import ServiceProviderDashboard from "../components/Dashboard/ServiceProviderDashboard";
import ServiceProviderServices from "../pages/ServiceProviderServices";
import ServiceProviderWallet from "../pages/ServiceProviderWallet";
import ServiceProviderBusiness from "../pages/ServiceProviderBusiness";
import ServiceProviderSettings from "../pages/ServiceProviderSettings";

const ServiceProviderRouter = () => {
  return (
    <Routes>
      {/* Service Provider Dashboard */}
      <Route 
        path="/" 
        element={<ServiceProviderDashboard />} 
      />
      
      {/* Service Provider Bookings */}
      <Route 
        path="/bookings" 
        element={<ServiceProviderBooking />} 
      />
      
      {/* Service Provider Profile */}
      <Route 
        path="/profile" 
        element={<ServiceProviderProfile />} 
      />
      
      {/* Service Provider Services Management */}
      <Route 
        path="/services" 
        element={<ServiceProviderServices />} 
      />
      
      {/* Service Provider Wallet */}
      <Route 
        path="/wallet" 
        element={<ServiceProviderWallet />} 
      />
      
      {/* Service Provider Business Details */}
      <Route 
        path="/business" 
        element={<ServiceProviderBusiness />} 
      />
      
      {/* Service Provider Settings */}
      <Route 
        path="/settings" 
        element={<ServiceProviderSettings />} 
      />
    </Routes>
  );
};

export default ServiceProviderRouter;

