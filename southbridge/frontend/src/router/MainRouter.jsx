import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "../pages/SignUp";
import NewSignUp from "../pages/NewSignUp";
import LoginFlow from "../pages/LoginFlow";
import Dashboard from "../pages/Dashboard";
import PrivateRouter from "./PrivateRouter";
import AdminPrivateRouter from "./AdminPrivateRouter";
import PublicRouter from "./PublicRouter";
import BottomNav from "../components/BottomNav";
import Load from "../pages/Load";
import Profile from "../pages/Profile";
import LoadBid from "../pages/LoadBid";
import Bids from "../pages/Bids";
import LocationRoute from "../pages/Route";
import RouteDetail from "../pages/RouteDetail";
import OrderDetail from "../pages/OrderDetail";
import TrackRoute from "../pages/TrackRoute";
import TrackOrder from "../components/tracking/TrackOrder";
import DriverTracking from "../pages/DriverTracking";
import OrderTracking from "../pages/OrderTracking";
import AdminLogin from "../pages/admin/Adminlogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Order from "../pages/Order";
import BEDDashboard from "../pages/BEDDashboard";
import BankDetailsRouter from "./BankDetailsRouter";
import ServiceProviderBooking from "../pages/ServiceProviderBooking";
import BookService from "../pages/BookService";
const MainRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/signup"
                    element={
                        <PublicRouter>
                            <NewSignUp />
                        </PublicRouter>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <PrivateRouter>
                            <Order />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/service-booking"
                    element={
                        <PrivateRouter>
                            <ServiceProviderBooking />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <PublicRouter>
                            <LoginFlow />
                        </PublicRouter>
                    }
                />
                <Route
                    path="/"
                    element={
                        <PrivateRouter>
                            <Dashboard />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/book-service"
                    element={
                        <PrivateRouter>
                            <BookService />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/load"
                    element={
                        <PrivateRouter>
                            <Load />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRouter>
                            <Profile />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/bed-dashboard"
                    element={
                        <PrivateRouter>
                            <BEDDashboard />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/bank-details/*"
                    element={
                        <PrivateRouter>
                            <BankDetailsRouter />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/load/:loadId"
                    element={
                        <PrivateRouter>
                            <LoadBid />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/bids"
                    element={
                        <PrivateRouter>
                            <Bids />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/route"
                    element={
                        <PrivateRouter>
                            <LocationRoute />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/route/:routeId"
                    element={
                        <PrivateRouter>
                            <RouteDetail />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/orders/:routeId"
                    element={
                        <PrivateRouter>
                            <RouteDetail />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/order/:orderId"
                    element={
                        <PrivateRouter>
                            <OrderDetail />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/track/:routeId"
                    element={
                        <PrivateRouter>
                            <TrackRoute />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/track-order/:orderId"
                    element={
                        <PrivateRouter>
                            <TrackOrder />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/driver/tracking/:routeId"
                    element={
                        <PrivateRouter>
                            <DriverTracking />
                        </PrivateRouter>
                    }
                />
                <Route
                    path="/tracking/order/:orderId"
                    element={
                        <PrivateRouter>
                            <OrderTracking />
                        </PrivateRouter>
                    }
                />
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin"
                    element={
                        <AdminPrivateRouter>
                            <AdminDashboard />
                        </AdminPrivateRouter>
                    }
                />

                <Route path="*" element={<h1>404 Not Found</h1>} />

                {/* Add more routes here */}
            </Routes>
        </BrowserRouter>
    );
};

export default MainRouter;
