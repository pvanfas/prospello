import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Filter,
    MapPin,
    Truck,
    Scale,
    CheckCircle,
    Clock,
    Package,
    ArrowRight,
    Users,
    Calendar,
    RefreshCw,
} from "lucide-react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places", "geocoding"];
import BidModal from "./BidModal";
import api from "../../services/api";

// Bid Modal Component


// Status badge component
const StatusBadge = ({ status, verified }) => {
    const getStatusConfig = () => {
        switch (status) {
            case "ACTIVE":
                return {
                    color: "bg-green-100 text-green-800 border-green-200",
                    text: "Active",
                };
            case "posted":
                return {
                    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    text: "Posted",
                };
            case "COMPLETED":
                return {
                    color: "bg-blue-100 text-blue-800 border-blue-200",
                    text: "Completed",
                };
            case "CANCELLED":
                return {
                    color: "bg-red-100 text-red-800 border-red-200",
                    text: "Cancelled",
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    text: "Bidding",
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="flex items-center gap-1.5">
            <span
                className={`px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}
            >
                {config.text}
            </span>
            {verified ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
                <Clock className="w-3.5 h-3.5 text-gray-400" />
            )}
        </div>
    );
};

// Load card component for browsing
const BrowseLoadCard = ({ load, index, onBid }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.3,
                delay: index * 0.03,
                type: "spring",
                stiffness: 150,
                damping: 20,
            }}
            whileHover={{
                scale: 1.01,
                y: -1,
                transition: { duration: 0.15, type: "spring", stiffness: 400 },
            }}
            className="w-full group cursor-pointer"
        >
            <div className="relative overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
                <div className="p-4">
                    {/* Header with status and company */}
                    <div className="flex items-center justify-between mb-3">
                        <StatusBadge
                            status={load.status}
                            verified={load.creator_verified}
                        />
                        <div className="text-right">
                            <div className="text-xs text-gray-500">
                                {load.time_posted}
                            </div>
                            <div className="text-xs font-medium text-gray-700">
                                {load.created_by}
                            </div>
                        </div>
                    </div>
                    {load.image_url && (
                        <div className="mb-3">
                            <img src={load.image_url} alt={load.goods_type} className="w-full h-auto rounded-md" />
                        </div>
                    )}

                    {/* Route display */}
                    <div className="space-y-2 text-sm mb-3">
                        {/* Origin - Show first */}
                        <div className="flex items-start gap-1.5 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-200">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500 mb-1">Origin</div>
                                <div className="text-sm font-medium text-gray-800 break-words leading-tight">
                                    {load.origin}
                                </div>
                            </div>
                        </div>
                        
                        {/* Arrow indicator */}
                        <div className="flex justify-center">
                            <ArrowRight className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        </div>
                        
                        {/* Destination - Show below origin */}
                        <div className="flex items-start gap-1.5 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-200">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500 mb-1">Destination</div>
                                <div className="text-sm font-medium text-gray-800 break-words leading-tight">
                                    {load.destination}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Distance and dates */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-xs">
                            <span className="text-gray-500">Distance: </span>
                            <span className="font-medium text-gray-800">
                                {load.distance ? load.distance.toFixed(2) : 'N/A'} KM
                            </span>
                        </div>
                        <div className="text-xs">
                            <span className="text-gray-500">Pickup: </span>
                            <span className="font-medium text-gray-800">
                                {new Date(
                                    load.pickup_date
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Goods and weight info */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-md">
                            <Truck className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 mb-1">Goods</p>
                                <p className="text-xs font-bold text-gray-800 break-words leading-tight">
                                    {load.goods_type}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-md">
                            <Scale className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 mb-1">Weight</p>
                                <p className="text-xs font-bold text-gray-800 break-words leading-tight">
                                    {load.weight}kg
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    {load.dimensions && (
                        <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-md mb-3">
                            <Package className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 mb-1">
                                    Dimensions
                                </p>
                                <p className="text-xs font-bold text-gray-800 break-words leading-tight">
                                    {load.dimensions}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Types */}
                    {load.vehicle_types && load.vehicle_types.length > 0 && (
                        <div className="flex items-start gap-1.5 p-2 bg-blue-50 rounded-md mb-3 border border-blue-100">
                            <Truck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-blue-600 mb-1">
                                    Vehicle Types
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {load.vehicle_types.map((type, idx) => (
                                        <span key={idx} className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full capitalize">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Special instructions */}
                    {load.special_instructions && (
                        <div className="p-2 bg-orange-50 border border-orange-100 rounded-md mb-3">
                            <p className="text-xs text-orange-600 font-medium mb-1">
                                Special Instructions
                            </p>
                            <p className="text-xs text-gray-800 line-clamp-2">
                                {load.special_instructions}
                            </p>
                        </div>
                    )}

                    {/* Rate and bidding info */}
                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-green-600">
                                    {load.lowest_bid != null && load.lowest_bid !== undefined
                                        ? `₹${load.lowest_bid}`
                                        : "No bids yet"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {load.lowest_bid && 'lowest'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">
                                    {load.bid_count} bids
                                </span>
                            </div>
                        </div>

                        {/* Bid button */}
                        <motion.button
                            onClick={() => onBid(load)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Place Bid
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Empty state component
const EmptyState = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
        >
            <div className="mb-4">
                <motion.div
                    className="relative w-20 h-20 mx-auto mb-6"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                >
                    <div className="absolute inset-0 bg-orange-100/30 rounded-full blur-md"></div>
                    <div className="relative w-full h-full bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
                        <Truck className="w-10 h-10 text-orange-500" />
                    </div>
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No loads available
                </h3>
                <p className="text-gray-500 text-base mb-6 max-w-sm mx-auto leading-relaxed">
                    There are no active loads matching your criteria at the
                    moment. Check back later!
                </p>
            </div>
        </motion.div>
    );
};

// Main BrowseLoadsPage component
const BrowseLoadsPage = () => {
    const [loads, setLoads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoad, setSelectedLoad] = useState(null);
    const [showBidModal, setShowBidModal] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);
    
    // Reverse loading states
    const [isReverseLoad, setIsReverseLoad] = useState(false);
    const [destination, setDestination] = useState({
        label: "",
        lat: null,
        lng: null,
    });
    
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, 
        libraries,
    });
    
    const [location, setLocation] = useState({
        label: "Detecting location...",
        lat: null,
        lng: null,
    });
    const [autocomplete, setAutocomplete] = useState(null);
    const [destinationAutocomplete, setDestinationAutocomplete] = useState(null);
    const inputRef = useRef(null);
    const destinationInputRef = useRef(null);

    // ✅ Fetch loads
    useEffect(() => {
        const fetchLoads = async () => {
            // For reverse loading, we need BOTH origin and destination coordinates
            if (isReverseLoad) {
                if (location.lat === null || location.lng === null || 
                    destination.lat === null || destination.lng === null) {
                    setLoads([]);
                    return;
                }
            } else {
                // For regular loading, we only need origin coordinates
                if (location.lat === null || location.lng === null) return;
            }
            
            setLoading(true);
            try {
                let response;
                if (isReverseLoad) {
                    // Reverse loading: Find loads along the driver's route (from origin to destination)
                    response = await api.get("/v1/load/nearby", {
                        params: {
                            driver_origin_lat: location.lat,
                            driver_origin_lng: location.lng,
                            driver_dest_lat: destination.lat,
                            driver_dest_lng: destination.lng,
                            reverse: true, // Flag to indicate route matching mode
                        },
                    });
                } else {
                    // Regular loading: Find loads starting FROM the origin
                    response = await api.get("/v1/load/nearby", {
                        params: {
                            lat: location.lat,
                            lng: location.lng,
                        },
                    });
                }
                
                console.log('====================================');
                console.log('Reverse Load Mode:', isReverseLoad);
                console.log('Driver Route:', isReverseLoad ? `${location.label} → ${destination.label}` : location.label);
                console.log('Response:', response.data);
                console.log('====================================');
                setLoads(response.data);
                setLocationError(null);
            } catch (error) {
                if(error.status === 404) {
                    setLoads([]);
                } else {
                    console.error("Failed to fetch loads:", error);
                    setLocationError("Failed to load loads for this location");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLoads();
    }, [location.lat, location.lng, location.label, isReverseLoad, destination.lat, destination.lng, destination.label]);

    // ✅ Detect current location on mount
    useEffect(() => {
        const getCurrentLocation = async () => {
            if (!isLoaded) return;
            
            if (!navigator.geolocation) {
                setLocationError("Geolocation is not supported by your browser");
                setLocation({
                    label: "Please search for a location",
                    lat: null,
                    lng: null,
                });
                setLocationLoading(false);
                return;
            }

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        resolve,
                        reject,
                        { 
                            enableHighAccuracy: true, 
                            timeout: 10000, 
                            maximumAge: 600000 
                        }
                    );
                });

                const { latitude, longitude } = position.coords;
                
                // Use the coordinates directly (more reliable than reverse geocoding)
                setLocation({
                    label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                    lat: latitude,
                    lng: longitude,
                });
                setLocationError(null);
                
            } catch (error) {
                console.error("Geolocation error:", error);
                setLocationError("Could not access your location. Please search for a location manually.");
                setLocation({
                    label: "Search location...",
                    lat: null,
                    lng: null,
                });
            } finally {
                setLocationLoading(false);
            }
        };

        getCurrentLocation();
    }, [isLoaded]);

    // ✅ Autocomplete Handlers for Origin
    const onLoad = (auto) => setAutocomplete(auto);

    const onPlaceChanged = () => {
        if (!autocomplete) return;
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
            setLocationError("Please select a valid location from the suggestions");
            return;
        }

        setLocation({
            label: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        });
        setLocationError(null);
    };

    // ✅ Autocomplete Handlers for Destination (Reverse Loading)
    const onDestinationLoad = (auto) => setDestinationAutocomplete(auto);

    const onDestinationPlaceChanged = () => {
        if (!destinationAutocomplete) return;
        const place = destinationAutocomplete.getPlace();
        
        if (!place.geometry) {
            setLocationError("Please select a valid destination from the suggestions");
            return;
        }

        setDestination({
            label: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        });
        setLocationError(null);
    };

    const handleBid = (load) => {
        setSelectedLoad(load);
        setShowBidModal(true);
    };

    const handleSubmitBid = async (bidData) => {
        
        try {
          await api.createBid(selectedLoad.id, bidData);
          
        } catch (error) {
          console.error("Error submitting bid:", error);
        }
        setLoads((prevLoads) =>
            prevLoads.map((load) =>
                load.id === bidData.loadId
                    ? { ...load, bids_count: load.bids_count + 1 }
                    : load
            )
        );
        alert(
            `Bid of ₹${bidData.amount.toLocaleString()} submitted successfully!`
        );
    };

    // Show location loading state
    if (locationLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Detecting your location...</p>
                </div>
            </div>
        );
    }

    // Show main loading state
    if (loading && location.lat !== null) {
        return (
            <div className="min-h-screen bg-gray-50 p-3">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="h-80 bg-gray-200 rounded-xl"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="max-w-7xl mx-auto p-3">
                {/* Error message */}
                {locationError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
                        {locationError}
                    </div>
                )}

                {/* Page Header */}
                <div className="mb-4 space-y-4">
                    {/* Reverse Loading Toggle */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-orange-500" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Reverse Loading
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Find loads going TO your destination
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReverseLoad(!isReverseLoad)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                    isReverseLoad ? "bg-orange-500" : "bg-gray-200"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        isReverseLoad ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Origin Location (Always visible in both modes) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isReverseLoad ? "Your Starting Location" : "Search Origin Location"}
                        </label>
                        <Autocomplete
                            onLoad={onLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                                fields: ["geometry", "name", "formatted_address"],
                            }}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={isReverseLoad ? "Where are you starting from?" : "Search for origin location..."}
                                className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </Autocomplete>
                        <p className="text-sm text-gray-500 mt-1">
                            {isReverseLoad ? "From: " : "Current: "}{location.label}
                        </p>
                    </div>

                    {/* Destination Location (Only visible when Reverse Loading is ON) */}
                    {isReverseLoad && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Where do you want to go? <span className="text-orange-500">*</span>
                            </label>
                            <Autocomplete
                                onLoad={onDestinationLoad}
                                onPlaceChanged={onDestinationPlaceChanged}
                                options={{
                                    fields: ["geometry", "name", "formatted_address"],
                                }}
                            >
                                <input
                                    ref={destinationInputRef}
                                    type="text"
                                    placeholder="Search for your destination..."
                                    className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </Autocomplete>
                            {destination.label && (
                                <p className="text-sm text-gray-500 mt-1">
                                    To: {destination.label}
                                </p>
                            )}
                            {!destination.label && (
                                <p className="text-sm text-orange-500 mt-1">
                                    Please select a destination to see loads along your route
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200"
                >
                    <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                            <span className="font-bold text-gray-800">
                                {loads.length}
                            </span>{" "}
                            {isReverseLoad 
                                ? `load${loads.length !== 1 ? 's' : ''} along your route`
                                : "loads available near origin"}
                        </div>
                        <div className="text-gray-600">
                            Updated{" "}
                            <span className="font-medium">just now</span>
                        </div>
                    </div>
                </motion.div>

                {/* Load Cards Grid */}
                {loads.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {loads.map((load, index) => (
                                <BrowseLoadCard
                                    key={load.id}
                                    load={load}
                                    index={index}
                                    onBid={handleBid}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <EmptyState />
                )}

                {/* Bid Modal */}
                <AnimatePresence>
                    {showBidModal && (
                        <BidModal
                            load={selectedLoad}
                            open={showBidModal}
                            onClose={() => setShowBidModal(false)}
                            onSubmit={handleSubmitBid}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BrowseLoadsPage;