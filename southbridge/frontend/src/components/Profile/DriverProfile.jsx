import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api, { walletAPI } from "../../services/api"; // Adjust the import path as necessary
import {
    MapPin,
    Star,
    Weight,
    Truck,
    CheckCircle,
    Clock,
    Phone,
    Mail,
    User,
    Edit3,
    Navigation,
    Route,
    Plus,
    X,
    FileText,
    Shield,
    CreditCard,
    Smartphone,
    Camera,
    Save,
    AlertCircle,
    Wallet,
    TrendingUp,
    Copy,
    Check,
    ChevronRight,
    Car,
} from "lucide-react";
import { useSelector } from "react-redux";
import BEDCard from "../BED/BEDCard";

const DriverProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    
    // Enhanced driver data state
    const [driverData, setDriverData] = useState({
        profile: {
            name: user?.username || "Driver",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        status: "Offline",
        rating: 0,
            totalTrips: 0,
            city: "Unknown",
            state: "Unknown",
            verified: false,
            phone: user?.phone_number || "",
            referCode: user?.refercode|| ""
        },
        vehicle: {
            type: "",
            registration: "",
            insurance: "",
            capacity: 0,
            fuelType: "Diesel"
        },
        routes: {
            preferredCount: 0,
            availableCapacity: 0,
            maxCapacity: 0,
            currentLoad: 0,
            status: "Available"
        },
        wallet: {
            balance: 0,
            lastPayout: "Never",
            pendingAmount: 0,
            currency: "INR"
        },
        payment: {
            method: "",
            accountType: "",
            accountNumber: "",
            verified: false
        }
    });

    // UI state
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingRoutes, setIsEditingRoutes] = useState(false);
    const [newRoute, setNewRoute] = useState("");
    const [routes, setRoutes] = useState([]);
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [editingData, setEditingData] = useState({});
    
    // Bank details state

    const getStatusColor = (status, type) => {
        const colors = {
            status: {
                Available: "bg-green-500",
                Offline: "bg-red-500",
                "On Route": "bg-blue-500",
            },
            verification: {
                Verified: "bg-blue-500",
                Pending: "bg-yellow-500",
                Rejected: "bg-red-500",
            },
        };
        return colors[type][status] || "bg-gray-500";
    };
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // Fetch complete driver profile data with wallet
            const driverResponse = await api.get('/v1/profile/driver/complete/');
            console.table(driverResponse.data);

            if (driverResponse.status === 200) {
                const data = driverResponse.data;
                
                // Determine payment method based on available fields
                let paymentMethod = "";
                let accountType = "";
                let accountNumber = "";
                
                if (data.upi_id) {
                    paymentMethod = "UPI";
                    accountType = "Google Pay";
                    accountNumber = data.upi_id;
                } else if (data.bank_account_number && data.ifsc_code && data.account_holder_name) {
                    paymentMethod = "Bank";
                    accountType = "Bank Account";
                    accountNumber = `****${data.bank_account_number.slice(-4)}`;
                }

                // Update driver data with enhanced structure
                setDriverData(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        name: data.username || user?.username || "Driver",
                        status: data.status || "Offline",
                        rating: data.rating || 0,
                        totalTrips: data.total_trips || 0,
                        city: data.current_city || "Unknown",
                        state: data.current_state || "Unknown",
                        verified: data.verification_status === "verified",
                        phone: data.phone_number || user?.phone_number || "",
                        referCode: data.refercode || user?.refercode || ""
                    },
                    vehicle: {
                        type: data.vehicle_type || "",
                        registration: data.vehicle_registration || "",
                        insurance: data.insurance_number || "",
                        capacity: data.max_weight_capacity || 0,
                        fuelType: "Diesel"
                    },
                    routes: {
                        preferredCount: data.preferred_routes ? data.preferred_routes.split(',').length : 0,
                        availableCapacity: data.available_capacity || 0,
                        maxCapacity: data.max_weight_capacity || 0,
                        currentLoad: data.current_load_weight || 0,
                        status: data.status === "available" ? "Available" : "Busy"
                    },
                    wallet: {
                        balance: data.wallet?.balance || 0,
                        lastPayout: "Oct 10, 2025", // This would come from wallet history
                        pendingAmount: 0, // This would be calculated from pending transactions
                        currency: "INR"
                    },
                    payment: {
                        method: paymentMethod,
                        accountType: accountType,
                        accountNumber: accountNumber,
                        verified: data.verification_status === "verified"
                    }
                }));
                
                // Initialize routes from the response
                if (data.preferred_routes) {
                    const routeArray = typeof data.preferred_routes === "string" 
                        ? data.preferred_routes.split(",").map(route => route.trim()).filter(route => route)
                        : Array.isArray(data.preferred_routes) 
                        ? data.preferred_routes 
                        : [];
                    setRoutes(routeArray);
                }
            }
        } catch (error) {
            console.error("Error fetching driver data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helper functions
    const handleCopyReferCode = () => {
        navigator.clipboard.writeText(driverData.profile.referCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const handleNavigation = (path) => {
        console.log(`Navigating to: ${path}`);
        navigate(path);
    };



    const StatusBadge = ({ status, verified }) => (
        <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === 'Available' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
                {status}
            </span>
            {verified && (
                <div className="flex items-center gap-1 px-2 py-1 bg-teal-50 rounded-full border border-teal-200">
                    <CheckCircle className="w-3 h-3 text-teal-600" />
                    <span className="text-xs font-medium text-teal-700">Verified</span>
                </div>
            )}
        </div>
    );

    const ProgressBar = ({ current, max, label }) => {
        const percentage = (current / max) * 100;
        const getColor = () => {
            if (percentage < 50) return 'bg-green-500';
            if (percentage < 80) return 'bg-yellow-500';
            return 'bg-red-500';
    };

    return (
            <div className="mt-3">
                <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-700">{label}</span>
                    <span className="text-gray-900">{current} / {max} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Capacity Usage</span>
                    <span className="font-semibold">{percentage.toFixed(0)}%</span>
                </div>
                    </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* BED Refer & Earn Card */}
                   
                    
                    {/* 1. Driver Overview Card */}
                    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 md:col-span-2 border border-gray-100">
                        <div className="flex items-start gap-4 mb-5">
                            <img 
                                src={driverData.profile.avatar} 
                                alt={driverData.profile.name}
                                className="w-20 h-20 rounded-2xl object-cover border-4 border-teal-400 shadow-md"
                            />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{driverData.profile.name}</h2>
                                <StatusBadge status={driverData.profile.status} verified={driverData.profile.verified} />
                            </div>
                            <User className="w-7 h-7 text-teal-500" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{driverData.profile.rating}</div>
                                    <div className="text-xs text-gray-600">{driverData.profile.totalTrips} trips</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <MapPin className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{driverData.profile.city}</div>
                                    <div className="text-xs text-gray-600">{driverData.profile.state}</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Refer Code Section
                        <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-purple-700 mb-1">Your Referral Code</div>
                                    <div className="text-lg font-bold text-purple-900 tracking-wider font-mono">
                                        {driverData.profile.referCode}
                        </div>
                    </div>
                                <button
                                    onClick={handleCopyReferCode}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                        copied 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="text-xs text-purple-600 mt-2">
                                Share this code with friends to earn rewards
                            </div>
                        </div>
                         */}
                        <button 
                            onClick={() => handleNavigation('/profile')}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98"
                        >
                            View Full Profile
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        </div>

                    {/* 2. Vehicle Info Card */}
                    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Vehicle Info</h3>
                                <p className="text-sm text-gray-600">Your registered vehicle</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditingVehicle(!isEditingVehicle)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Edit3 className="w-4 h-4 text-gray-600" />
                                </button>
                                <div className="bg-teal-100 p-3 rounded-xl">
                                    <Car className="w-6 h-6 text-teal-600" />
                                </div>
                            </div>
                        </div>

                        {isEditingVehicle ? (
                            <div className="space-y-3 mb-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                    <select
                                        value={driverData.vehicle.type}
                                        onChange={(e) => setDriverData(prev => ({
                                            ...prev,
                                            vehicle: { ...prev.vehicle, type: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                    >
                                        <option value="">Select Vehicle Type</option>
                                        <option value="truck">Truck</option>
                                        <option value="van">Van</option>
                                        <option value="trailer">Trailer</option>
                                        <option value="container">Container</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                    <input
                                        type="text"
                                        value={driverData.vehicle.registration}
                                        onChange={(e) => setDriverData(prev => ({
                                            ...prev,
                                            vehicle: { ...prev.vehicle, registration: e.target.value.toUpperCase() }
                                        }))}
                                        placeholder="Enter registration number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                                    <input
                                        type="text"
                                        value={driverData.vehicle.insurance}
                                        onChange={(e) => setDriverData(prev => ({
                                            ...prev,
                                            vehicle: { ...prev.vehicle, insurance: e.target.value }
                                        }))}
                                        placeholder="Enter insurance number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingVehicle(false)}
                                        className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingVehicle(false)}
                                        className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Vehicle Type</span>
                                    <span className="text-sm font-bold text-gray-900">{driverData.vehicle.type || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Registration</span>
                                    <span className="text-sm font-mono font-bold text-gray-900">{driverData.vehicle.registration || "Not provided"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Insurance</span>
                                    <span className="text-xs font-mono text-gray-700">{driverData.vehicle.insurance || "Not provided"}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => handleNavigation('/vehicle')}
                            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            View Vehicle Details
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 3. Routes & Capacity Card */}
                    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Routes & Load</h3>
                                <p className="text-sm text-gray-600">Capacity management</p>
                            </div>
                            <div className="bg-teal-100 p-3 rounded-xl">
                                <Route className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                        
                        <div className="space-y-3 mb-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Preferred Routes</span>
                                <span className="text-sm font-bold text-gray-900">{driverData.routes.preferredCount} routes</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-sm font-medium text-gray-700">Current Status</span>
                                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                                    {driverData.routes.status}
                                </span>
                            </div>
                        </div>
                        
                        <ProgressBar 
                            current={driverData.routes.currentLoad}
                            max={driverData.routes.maxCapacity}
                            label="Current Load"
                        />
                        
                        <button 
                            onClick={() => handleNavigation('/routes')}
                            className="w-full mt-5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            View Route Details
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 4. Wallet Card */}
                    <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 md:col-span-2 border border-teal-400 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
                        
                        <div className="relative">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Wallet Balance</h3>
                                    <p className="text-sm text-teal-100">Your available funds</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            
                            <div className="mb-5">
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-teal-100 text-lg">₹</span>
                                    <span className="text-5xl font-bold text-white">
                                        {driverData.wallet.balance.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                    <div>
                                        <div className="text-xs text-teal-100 mb-1">Last Payout</div>
                                        <div className="text-sm font-semibold text-white">{driverData.wallet.lastPayout}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-teal-100 mb-1">Pending</div>
                                        <div className="text-sm font-semibold text-white">₹{driverData.wallet.pendingAmount.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            </div>

                        <div className="flex gap-2">
                                <button 
                                    onClick={() => handleNavigation('/wallet')}
                                    className="flex-1 bg-white text-teal-600 font-semibold py-4 px-6 rounded-xl hover:bg-teal-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <TrendingUp className="w-5 h-5" />
                                    Go to Wallet
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/bank-details')}
                                    className="flex-1 bg-white/20 text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Bank Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 5. Payments Card */}
                    
                    <BEDCard user={{
                        ...user,
                        refercode: driverData.profile.referCode || user?.refercode,
                        username: driverData.profile.name || user?.username,
                        email: user?.email,
                        phone_number: driverData.profile.phone || user?.phone_number
                    }} />

                </div>
            </main>
        </div>
    );
};

export default DriverProfilePage;
