import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import api from "../services/api";

const BookService = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedRadius, setSelectedRadius] = useState(20);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/v1/service/service-categories/");
                if (response.status === 200) {
                    const categories = [
                        { key: "all", label: "All" },
                        ...response.data.map(cat => ({
                            key: cat.slug,
                            label: cat.name
                        }))
                    ];
                    setServiceCategories(categories);
                }
            } catch (error) {
                console.error("Error fetching service categories:", error);
                // Fallback to default categories
                setServiceCategories([
                    { key: "all", label: "All" },
                    { key: "towing", label: "Towing" },
                    { key: "repair", label: "Repair" },
                    { key: "maintenance", label: "Maintenance" },
                    { key: "wash", label: "Wash" },
                ]);
            } finally {
                setLoading(false);
            }
        };

        // Fetch categories immediately on component mount
        fetchCategories();
    }, []);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Default to a location if geolocation fails
                    setUserLocation({
                        lat: 28.6139, // Delhi coordinates as fallback
                        lng: 77.2090
                    });
                }
            );
        } else {
            // Fallback location
            setUserLocation({
                lat: 28.6139,
                lng: 77.2090
            });
        }
    }, []);

    // Fetch nearby services
    const fetchNearbyServices = async (pageNum = 1, reset = false) => {
        if (!userLocation) return;

        setServicesLoading(true);
        try {
            const params = {
                lat: userLocation.lat,
                lng: userLocation.lng,
                radius: selectedRadius,
                service_type: selectedCategory === "all" ? "all" : selectedCategory,
                page: pageNum,
                limit: 10
            };

            const response = await api.get("/v1/service/nearby-services/", { params });
            
            if (response.status === 200) {
                const newServices = response.data;
                
                if (reset) {
                    setServices(newServices);
                } else {
                    setServices(prev => [...prev, ...newServices]);
                }
                
                setHasMore(newServices.length === 10); // If we get less than 10, no more pages
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Error fetching nearby services:", error);
        } finally {
            setServicesLoading(false);
        }
    };

    // Load more services (for pagination)
    const loadMoreServices = () => {
        if (!servicesLoading && hasMore) {
            fetchNearbyServices(page + 1, false);
        }
    };

    // Initial load of services
    useEffect(() => {
        if (userLocation) {
            fetchNearbyServices(1, true);
        }
    }, [userLocation, selectedCategory, selectedRadius]);

    // Handle booking service
    const handleBookService = (service) => {
        setSelectedService(service);
        setShowBookingModal(true);
    };

    // Submit booking
    const submitBooking = async (bookingData) => {
        try {
            setBookingLoading(true);
            const response = await api.post("/v1/service/book-service/", {
                booked_category_id: selectedService.provider_category.id,
                service_description: bookingData.service_description,
                vehicle_details: bookingData.vehicle_details,
                service_latitude: userLocation.lat,
                service_longitude: userLocation.lng,
                service_address: bookingData.service_address,
                scheduled_at: bookingData.scheduled_at,
                is_emergency: bookingData.is_emergency,
                estimated_cost: selectedService.provider_category.price_from
            });

            if (response.status === 200) {
                console.log('Booking successful:', response.data);
                setShowBookingModal(false);
                setSelectedService(null);
                // Show success message
                alert('Service booked successfully! Booking ID: ' + response.data.booking_id);
            }
        } catch (error) {
            console.error("Error booking service:", error);
            alert('Failed to book service. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <>
        <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-6">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Book a Service</h1>
                    <button
                        type="button"
                        onClick={() => setShowFilters((v) => !v)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                </div>
                
                {showFilters && (
                    <div className="mb-6 bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
                        <div className="space-y-4">
                            {/* Service Category Filter */}
                            <div>
                                <p className="text-sm font-semibold text-gray-900 mb-3">Service Category</p>
                                {loading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                                        <span className="ml-2 text-sm text-gray-600">Loading categories...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {serviceCategories.map((cat) => (
                                            <label
                                                key={cat.key}
                                                className="flex items-center gap-2 rounded-xl border border-gray-200 hover:border-orange-300 px-3 py-2 cursor-pointer"
                                            >
                                                <input
                                                    type="radio"
                                                    name="service-category"
                                                    value={cat.key}
                                                    checked={selectedCategory === cat.key}
                                                    onChange={() => setSelectedCategory(cat.key)}
                                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="text-sm text-gray-800">{cat.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Radius Filter */}
                            <div>
                                <p className="text-sm font-semibold text-gray-900 mb-3">Search Radius</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Distance: {selectedRadius} km</span>
                                        <span className="text-xs text-gray-500">Max: 100 km</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={selectedRadius}
                                        onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                        style={{
                                            background: `linear-gradient(to right, #f97316 0%, #f97316 ${selectedRadius}%, #e5e7eb ${selectedRadius}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>1 km</span>
                                        <span>50 km</span>
                                        <span>100 km</span>
                                    </div>
                                </div>
                            </div>

                            {/* Apply Filter Button */}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log('Applied filters:', {
                                            category: selectedCategory,
                                            radius: selectedRadius
                                        });
                                        // Reset services and fetch with new filters
                                        setServices([]);
                                        setPage(1);
                                        setHasMore(true);
                                        fetchNearbyServices(1, true);
                                        setShowFilters(false);
                                    }}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 active:bg-orange-700"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services List */}
                <div className="space-y-4">
                    {servicesLoading && services.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                            <span className="ml-3 text-gray-600">Loading services...</span>
                        </div>
                    ) : services.length > 0 ? (
                        <>
                            {services.map((service, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{service.service_provider.business_name}</h3>
                                            <p className="text-sm text-gray-600">{service.category.name}</p>
                                            <p className="text-xs text-gray-500">{service.distance} km away</p>
                                            <p className="text-sm text-orange-600 font-medium">
                                                ₹{service.provider_category.price_from} - ₹{service.provider_category.price_to}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {service.service_provider.rating} ⭐
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {service.service_provider.total_services} services
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Book Now Button */}
                                    <button
                                        onClick={() => handleBookService(service)}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 active:bg-orange-700"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ))}
                            
                            {/* Load More Button */}
                            {hasMore && (
                                <button
                                    onClick={loadMoreServices}
                                    disabled={servicesLoading}
                                    className="w-full py-3 px-4 bg-orange-50 border border-orange-200 text-orange-600 font-medium rounded-xl hover:bg-orange-100 transition-colors disabled:opacity-50"
                                >
                                    {servicesLoading ? "Loading..." : "Load More Services"}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="bg-white border border-orange-100 rounded-2xl p-6 text-center">
                            <div className="h-24 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-medium">
                                No services found
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Book Service</h3>
                        <button
                            onClick={() => setShowBookingModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Service Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <h4 className="font-medium text-gray-900">{selectedService.service_provider.business_name}</h4>
                        <p className="text-sm text-gray-600">{selectedService.category.name}</p>
                        <p className="text-sm text-orange-600 font-medium">
                            ₹{selectedService.provider_category.price_from} - ₹{selectedService.provider_category.price_to}
                        </p>
                    </div>
                    
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const bookingData = {
                            service_description: formData.get('service_description'),
                            vehicle_details: formData.get('vehicle_details'),
                            service_address: formData.get('service_address'),
                            scheduled_at: formData.get('scheduled_at'),
                            is_emergency: formData.get('is_emergency') === 'on'
                        };
                        submitBooking(bookingData);
                    }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Description</label>
                                <textarea
                                    name="service_description"
                                    required
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Describe the service you need..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Details</label>
                                <input
                                    type="text"
                                    name="vehicle_details"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="e.g., Toyota Camry 2020, White"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Address</label>
                                <textarea
                                    name="service_address"
                                    required
                                    rows={2}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Enter the address where service is needed..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="scheduled_at"
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_emergency"
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">This is an emergency service</label>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                {bookingLoading ? 'Booking...' : 'Book Service'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default BookService;




