import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, Phone, User, Gift, Lock, Truck, Building2, Users, Wrench, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import api from "../services/api";
import { Autocomplete, useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

const libraries = ["places", "geocoding"];

const NewSignUp = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: "", message: "" });
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone_number: "",
        role: "",
        refercode: "",
        // Profile data based on role
        profileData: {}
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    
    // Google Maps and location states
    const [autocomplete, setAutocomplete] = useState(null);
    const [modalAutocomplete, setModalAutocomplete] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [map, setMap] = useState(null);
    const autocompleteRef = useRef(null);
    
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(
            () => setToast({ show: false, type: "", message: "" }),
            3000
        );
    };

    // Fetch service categories when component mounts
    useEffect(() => {
        const fetchServiceCategories = async () => {
            try {
                const response = await api.get("/v1/service-categories/public");
                setServiceCategories(response.data || []);
            } catch (error) {
                console.error("Error fetching service categories:", error);
                // Don't show error toast as this is not critical for signup
            }
        };
        fetchServiceCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProfileDataChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            profileData: {
                ...prev.profileData,
                [field]: value
            }
        }));
    };

    // Location handling functions
    const onAutocompleteLoad = (auto) => {
        setAutocomplete(auto);
    };

    const onModalAutocompleteLoad = (auto) => {
        setModalAutocomplete(auto);
    };

    const onModalAutocompletePlaceChanged = () => {
        if (!modalAutocomplete) return;
        const place = modalAutocomplete.getPlace();
        
        if (!place.geometry) {
            showToast("error", "Please select a valid location from the suggestions");
            return;
        }

        const location = {
            address: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };

        setSelectedLocation(location);
        handleProfileDataChange("shop_location_address", location.address);
        handleProfileDataChange("shop_location_latitude", location.lat);
        handleProfileDataChange("shop_location_longitude", location.lng);
        
        // Update map center to show the selected location
        setMapCenter({ lat: location.lat, lng: location.lng });
        
        // If map is already loaded, pan to the new location
        if (map) {
            map.panTo({ lat: location.lat, lng: location.lng });
            map.setZoom(15);
        }
    };

    const onAutocompletePlaceChanged = () => {
        if (!autocomplete) return;
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
            showToast("error", "Please select a valid location from the suggestions");
            return;
        }

        const location = {
            address: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };

        setSelectedLocation(location);
        handleProfileDataChange("shop_location_address", location.address);
        handleProfileDataChange("shop_location_latitude", location.lat);
        handleProfileDataChange("shop_location_longitude", location.lng);
        
        // Update map center to show the selected location
        setMapCenter({ lat: location.lat, lng: location.lng });
        
        // If map is already loaded, pan to the new location
        if (map) {
            map.panTo({ lat: location.lat, lng: location.lng });
            map.setZoom(15);
        }
    };

    const openMapModal = () => {
        if (selectedLocation) {
            setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
        }
        setShowMapModal(true);
    };

    const closeMapModal = () => {
        setShowMapModal(false);
    };

    const onMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Reverse geocoding to get address
        if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = {
                        address: results[0].formatted_address,
                        lat: lat,
                        lng: lng,
                    };
                    setSelectedLocation(location);
                    handleProfileDataChange("shop_location_address", location.address);
                    handleProfileDataChange("shop_location_latitude", location.lat);
                    handleProfileDataChange("shop_location_longitude", location.lng);
                }
            });
        }
    };

    const onMapLoad = (mapInstance) => {
        setMap(mapInstance);
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d*$/.test(pasted)) return;        
        const newOtp = [...otp];
        pasted.split('').forEach((ch, i) => (newOtp[i] = ch));
        setOtp(newOtp);
       
        const last = Math.min(pasted.length, 5);
        document.getElementById(`otp-${last}`)?.focus();
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.username || !formData.phone_number) {
                showToast("error", "Username and phone number are required");
                return false;
            }
        } else if (step === 2) {
            if (!formData.role) {
                showToast("error", "Please select a role");
                return false;
            }
        } else if (step === 3) {
            // Validate profile data based on role
            if (formData.role === "driver") {
                if (!formData.profileData.license_number || !formData.profileData.vehicle_type || !formData.profileData.max_weight_capacity || !formData.profileData.vehicle_registration) {
                    showToast("error", "License number, vehicle type, weight capacity, and registration number are required");
                    return false;
                }
            } else if (formData.role === "shipper") {
                if (!formData.profileData.company_name) {
                    showToast("error", "Company name is required");
                    return false;
                }
            } else if (formData.role === "broker") {
                if (!formData.profileData.company_name) {
                    showToast("error", "Company name is required");
                    return false;
                }
            } else if (formData.role === "service_provider") {
                if (!formData.profileData.business_name || !formData.profileData.business_type || !formData.profileData.license_number || !formData.profileData.shop_location_address || selectedCategories.length === 0) {
                    showToast("error", "Business name, type, license number, shop location, and at least one service category are required");
                    return false;
                }
            }
        }
        return true;
    };

    const handleNextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const send_otp = async () => {
        try {
            setIsLoading(true);
            const response = await api.post("/v1/auth/send-otp/", {
                phone_number: formData.phone_number,
            });
            if (response.status === 200) {
                showToast("success", "OTP sent successfully");
                console.log("OTP sent to:", formData.phone_number);
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            if(error.response.data.detail == "User already exists"){
                showToast("error", "User already exists");
                navigate("/login");
            }
            else{
                showToast("error", "Failed to send OTP");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setIsLoading(true);
            if(formData.email.trim() == "" ){
                formData.email = null;
            }
            
            // Create user with profile in single request
            const signupData = {
                ...formData, 
                otp: otp.join('')
            };
            
            // Add service provider specific data
            if (formData.role === "service_provider") {
                signupData.selectedCategories = selectedCategories;
            }
            
            const userResponse = await api.post("/v1/auth/signup/", signupData);
            
            if (userResponse.status === 201) {
                showToast("success", "Account and profile created successfully");
                dispatch(
                    loginSuccess({
                        accessToken: userResponse.data.access_token,
                        refreshToken: userResponse.data.refresh_token,
                        user: userResponse.data.user,
                    })
                );
                navigate("/");
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("error", "Failed to verify OTP or create profile");
        } finally {
            setIsLoading(false);
        }
    };

    const maskPhoneNumber = (phone) => {
        if (phone.length <= 4) return `+91 ${phone}`;
        const visiblePart = phone.slice(-4);
        const maskedPart = "•".repeat(phone.length - 4);
        return `+91 ${maskedPart}${visiblePart}`;
    };

    const isOtpComplete = otp.every((digit) => digit !== "");

    const steps = [
        { number: 1, label: "Basic Info", icon: User },
        { number: 2, label: "Role", icon: Gift },
        { number: 3, label: "Profile", icon: formData.role === "driver" ? Truck : formData.role === "shipper" ? Building2 : Users },
        { number: 4, label: "Refer Code", icon: Lock },
        { number: 5, label: "Verify", icon: Phone },
    ];

    const renderProfileFields = () => {
        if (formData.role === "driver") {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            License Number *
                        </label>
                        <input
                            type="text"
                            value={formData.profileData.license_number || ""}
                            onChange={(e) => handleProfileDataChange("license_number", e.target.value)}
                            placeholder="Enter your license number"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Vehicle Type *
                        </label>
                        <select
                            value={formData.profileData.vehicle_type || ""}
                            onChange={(e) => handleProfileDataChange("vehicle_type", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select vehicle type</option>
                            <option value="Truck">Truck</option>
                            <option value="Trailer">Trailer</option>
                            <option value="Pickup">Pickup</option>
                            <option value="Refrigerated">Refrigerated</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Max Weight Capacity (kg) *
                        </label>
                        <input
                            type="number"
                            value={formData.profileData.max_weight_capacity || ""}
                            onChange={(e) => handleProfileDataChange("max_weight_capacity", e.target.value)}
                            placeholder="Enter maximum weight capacity"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Vehicle Registration Number *
                        </label>
                        <input
                            type="text"
                            value={formData.profileData.vehicle_registration || ""}
                            onChange={(e) => handleProfileDataChange("vehicle_registration", e.target.value)}
                            placeholder="Enter vehicle registration number"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            );
        } else if (formData.role === "shipper" || formData.role === "broker") {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            value={formData.profileData.company_name || ""}
                            onChange={(e) => handleProfileDataChange("company_name", e.target.value)}
                            placeholder="Enter your company name"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            );
        } else if (formData.role === "service_provider") {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Business Name *
                        </label>
                        <input
                            type="text"
                            value={formData.profileData.business_name || ""}
                            onChange={(e) => handleProfileDataChange("business_name", e.target.value)}
                            placeholder="Enter your business name"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Business Type *
                        </label>
                        <select
                            value={formData.profileData.business_type || ""}
                            onChange={(e) => handleProfileDataChange("business_type", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select business type</option>
                            <option value="Individual">Individual</option>
                            <option value="Company">Company</option>
                            <option value="Franchise">Franchise</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            License Number *
                        </label>
                        <input
                            type="text"
                            value={formData.profileData.license_number || ""}
                            onChange={(e) => handleProfileDataChange("license_number", e.target.value)}
                            placeholder="Enter your business license number"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Shop Location Address *
                        </label>
                        <div className="space-y-2">
                            {isLoaded ? (
                                <Autocomplete
                                    onLoad={onAutocompleteLoad}
                                    onPlaceChanged={onAutocompletePlaceChanged}
                                    options={{
                                        types: ['establishment', 'geocode'],
                                        componentRestrictions: { country: 'in' }
                                    }}
                                >
                                    <input
                                        ref={autocompleteRef}
                                        type="text"
                                        value={formData.profileData.shop_location_address || ""}
                                        onChange={(e) => handleProfileDataChange("shop_location_address", e.target.value)}
                                        placeholder="Search for your shop location..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    />
                                </Autocomplete>
                            ) : (
                                <input
                                    type="text"
                                    value={formData.profileData.shop_location_address || ""}
                                    onChange={(e) => handleProfileDataChange("shop_location_address", e.target.value)}
                                    placeholder="Search for your shop location..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                />
                            )}
                            <button
                                type="button"
                                onClick={openMapModal}
                                className="flex items-center justify-center w-full px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-xl hover:bg-orange-200 transition-colors duration-200"
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                Search on Map
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Service Categories *
                        </label>
                        <div className="space-y-2">
                            {serviceCategories.map((category) => (
                                <label key={category.id} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCategories([...selectedCategories, category.id]);
                                            } else {
                                                setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                                            }
                                        }}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <div className="ml-3">
                                        <div className="font-medium text-gray-900">{category.name}</div>
                                        {category.description && (
                                            <div className="text-sm text-gray-500">{category.description}</div>
                                        )}
                                        {category.is_emergency && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full mt-1">
                                                Emergency Service
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                        {selectedCategories.length === 0 && (
                            <p className="text-sm text-red-500 mt-1">Please select at least one service category</p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex flex-col">
            {/* Toast */}
            {toast.show && (
                <div
                    className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
                        toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    {toast.message}
                </div>
            )}

            {/* Header - Simplified */}
            <div className="flex-shrink-0 px-4 py-4 sm:px-6">
                <div className="text-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {step === 1
                            ? "Create Account"
                            : step === 2
                            ? "Select Role"
                            : step === 3
                            ? `Complete ${formData.role === "driver" ? "Driver" : formData.role === "shipper" ? "Shipper" : "Broker"} Profile`
                            : step === 4
                            ? "Referral Code"
                            : "Verify Phone"}
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {step === 1
                            ? "Start with your basic information"
                            : step === 2
                            ? "Choose your role on our platform"
                            : step === 3
                            ? `Complete your ${formData.role} profile to get started`
                            : step === 4
                            ? "Enter referral code (optional)"
                            : "Enter the code sent to your phone"}
                    </p>
                </div>
            </div>

            {/* Step Indicator - Compact */}
            <div className="px-4 sm:px-6">
                <div className="max-w-sm mx-auto">
                    <div className="flex justify-between mb-6">
                        {steps.map((s, index) => {
                            const IconComponent = s.icon;
                            return (
                                <div
                                    key={s.number}
                                    className="flex items-center"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            step >= s.number
                                                ? "bg-gradient-to-r from-orange-500 to-teal-500 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`w-6 h-1 mx-2 transition-all duration-300 ${
                                                step > s.number
                                                    ? "bg-gradient-to-r from-orange-500 to-teal-500"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 pb-8 sm:px-6">
                <div className="max-w-sm mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-8 sm:px-8">
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Username *
                                            </label>
                                            <input
                                                name="username"
                                                type="text"
                                                required
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                placeholder="Choose a username"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email (optional)
                                            </label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Enter your email"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-lg text-sm">
                                                    +91
                                                </div>
                                                <input
                                                    name="phone_number"
                                                    type="tel"
                                                    required
                                                    value={formData.phone_number}
                                                    onChange={handleInputChange}
                                                    placeholder="98765 43210"
                                                    className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleNextStep}
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                        >
                                            Continue{" "}
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Role */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-4">
                                            Select your role *
                                        </label>
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    value: "shipper",
                                                    label: "📦 Shipper",
                                                    desc: "Send shipments",
                                                },
                                                {
                                                    value: "driver",
                                                    label: "🚛 Driver",
                                                    desc: "Deliver shipments",
                                                },
                                                {
                                                    value: "service_provider",
                                                    label: "🔧 Service Provider",
                                                    desc: "Provide vehicle services",
                                                },
                                            ].map((role) => (
                                                <label
                                                    key={role.value}
                                                    className="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200"
                                                    style={{
                                                        borderColor:
                                                            formData.role ===
                                                            role.value
                                                                ? "#f97316"
                                                                : "#e5e7eb",
                                                        backgroundColor:
                                                            formData.role ===
                                                            role.value
                                                                ? "#fff7ed"
                                                                : "#ffffff",
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value={role.value}
                                                        checked={
                                                            formData.role ===
                                                            role.value
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                    <div className="ml-3">
                                                        <div className="font-semibold text-gray-900">
                                                            {role.label}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {role.desc}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNextStep}
                                            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center"
                                        >
                                            Continue{" "}
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Profile Details */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            {formData.role === "driver" ? "Driver Information" : 
                                             formData.role === "shipper" ? "Company Information" : 
                                             formData.role === "service_provider" ? "Service Provider Information" :
                                             "Broker Information"}
                                        </h3>
                                        {renderProfileFields()}
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNextStep}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center"
                                        >
                                            Continue{" "}
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Referral Code */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Referral Code (optional)
                                        </label>
                                        <input
                                            name="refercode"
                                            type="text"
                                            value={formData.refercode}
                                            onChange={handleInputChange}
                                            placeholder="Enter referral code if you have one"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            You'll get a referral code after verification
                                        </p>
                                    </div>

                                    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                                        <p className="text-sm text-teal-900">
                                            💡 Referral codes help you earn rewards. If you don't have one, you'll get one to share after signup.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setStep(3)}
                                            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => {
                                                send_otp();
                                                setStep(5);
                                            }}
                                            disabled={isLoading}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send OTP{" "}
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: OTP Verification */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <div className="text-center pb-4">
                                        <div className="w-12 h-12 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <p className="text-gray-600 text-sm mb-1">
                                            Verification code sent to
                                        </p>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {maskPhoneNumber(
                                                formData.phone_number
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-center space-x-2">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) =>
                                                        handleOtpChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    onPaste={(e) =>
                                                        handleOtpPaste(e)
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleOtpKeyDown(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    
                                                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50"
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={verifyOtp}
                                            disabled={
                                                !isOtpComplete || isLoading
                                            }
                                            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    Verify Code{" "}
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="text-center space-y-3">
                                        <button
                                            onClick={() => setStep(4)}
                                            className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
                                        >
                                            ← Back
                                        </button>

                                        <div className="text-sm text-gray-600">
                                            Didn't receive the code?{" "}
                                            <button
                                                onClick={send_otp}
                                                disabled={isLoading}
                                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                                            >
                                                Resend
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600 text-sm">
                            Already have an account?{" "}
                            <button className="text-orange-600 hover:text-orange-700 font-semibold">
                                Log in
                            </button>
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Picker Modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Search Shop Location</h3>
                            <button
                                onClick={closeMapModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                {isLoaded ? (
                                    <Autocomplete
                                        onLoad={onModalAutocompleteLoad}
                                        onPlaceChanged={onModalAutocompletePlaceChanged}
                                        options={{
                                            types: ['establishment', 'geocode'],
                                            componentRestrictions: { country: 'in' }
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Search for your shop location..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </Autocomplete>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Search for your shop location..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    />
                                )}
                                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        
                        <div className="flex-1 relative">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={mapCenter}
                                    zoom={15}
                                    onClick={onMapClick}
                                    onLoad={onMapLoad}
                                >
                                    {selectedLocation && (
                                        <Marker
                                            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                                        />
                                    )}
                                </GoogleMap>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading map...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={closeMapModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={closeMapModal}
                                    disabled={!selectedLocation}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewSignUp;