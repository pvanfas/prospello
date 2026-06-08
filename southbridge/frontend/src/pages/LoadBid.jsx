import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

// Header Component
const BidListHeader = ({ onBackClick }) => (
    <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
            <button
                onClick={onBackClick}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
                Bids for Load
            </h1>
            <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>
    </div>
);

// Action Button Component
const ActionButton = ({ type, onClick, children, className = "" }) => {
    const baseClasses =
        "flex-1 font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]";

    const typeClasses = {
        accept: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl",
        decline:
            "bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${typeClasses[type]} ${className}`}
        >
            {children}
        </button>
    );
};

// Bid Card Component
const BidCard = ({ bid, onAccept, onDecline, isAnimated }) => {
    const [expiryMinutes, setExpiryMinutes] = useState(120); // default 2h

    // Predefined expiry options (minutes)
    const expiryOptions = [
        { label: "30 min", value: 30 },
        { label: "1 hour", value: 60 },
        { label: "2 hours", value: 120 },
        { label: "4 hours", value: 240 },
        { label: "8 hours", value: 480 },
        { label: "12 hours", value: 720 },
        { label: "24 hours", value: 1440 },
    ];

    return (
        <div
            className={`bg-white rounded-2xl shadow-md border border-gray-100 p-5 transition-all duration-500 transform ${
                isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
            {/* Bid Header with Vehicle Image */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-baseline space-x-1 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                            ₹{bid.amount.toLocaleString()}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Placed by:</span>{" "}
                        {bid.driver_name}
                    </div>
                    <div className="text-xs text-gray-500">
                        ID: DRV • {bid.driver_id}
                    </div>
                </div>
                
                {/* Vehicle Image */}
                {bid.vehicle_image && (
                    <div className="ml-4 flex-shrink-0">
                        <img
                            src={bid.vehicle_image}
                            alt="Vehicle"
                            className="w-16 h-12 rounded-lg object-contain border border-gray-200 shadow-sm bg-gray-50"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Timer Selector */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">
                    Expiry Timer:
                </label>
                <select
                    value={expiryMinutes}
                    onChange={(e) => setExpiryMinutes(parseInt(e.target.value))}
                    className="ml-2 border border-gray-300 rounded-md p-1 text-sm"
                >
                    {expiryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4">
                <ActionButton type="accept" onClick={() => onAccept(bid.id, expiryMinutes)}>
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                </ActionButton>

                <ActionButton type="decline" onClick={() => onDecline(bid.id)}>
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                </ActionButton>
            </div>
        </div>
    );
};


// Toast Notification Component
const ToastNotification = ({ toast }) => {
    if (!toast.show) return null;

    return (
        <div
            className={`fixed bottom-6 left-4 right-4 z-50 transform transition-all duration-300 ${
                toast.show
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0"
            }`}
        >
            <div
                className={`rounded-xl p-4 shadow-lg border-l-4 ${
                    toast.type === "accepted"
                        ? "bg-green-50 border-green-400 text-green-800"
                        : "bg-red-50 border-red-400 text-red-800"
                }`}
            >
                <div className="flex items-center">
                    <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                            toast.type === "accepted"
                                ? "bg-green-400"
                                : "bg-red-400"
                        }`}
                    >
                        {toast.type === "accepted" ? (
                            <Check className="w-3 h-3 text-white" />
                        ) : (
                            <X className="w-3 h-3 text-white" />
                        )}
                    </div>
                    <p className="font-medium">{toast.message}</p>
                </div>
            </div>
        </div>
    );
};

// Bid List Container Component
const BidListContainer = ({ bids, onAccept, onDecline, animatingCards }) => (
    <div className="p-4 pb-6 space-y-4">
        {bids.map((bid, index) => (
            <BidCard
                key={bid.id}
                bid={bid}
                onAccept={onAccept}
                onDecline={onDecline}
                isAnimated={animatingCards.has(index)}
            />
        ))}
    </div>
);

// Custom Hook for Toast Management
const useToast = () => {
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    return { toast, showToast };
};

// Custom Hook for Card Animations
const useCardAnimations = (bids) => {
    const [animatingCards, setAnimatingCards] = useState(new Set());

    useEffect(() => {
        // Stagger card entrance animations
        bids.forEach((_, index) => {
            setTimeout(() => {
                setAnimatingCards((prev) => new Set([...prev, index]));
            }, index * 100);
        });
    }, [bids.length]);

    return animatingCards;
};

// Main BidListPage Component
const BidListPage = () => {
    const { loadId } = useParams();
    const [bids, setBids] = useState([]);

    const navigate = useNavigate();
    const fetchData = async () => {
        // Fetch bids from API
        // const response = await api.get(`/v1/bids?load_id=${loadId}`);
        // setBids(response.data);
        try {
            const response = await api.getBidsForLoad(loadId);
            console.log("Fetched bids successfully:", response.data);
            setBids(response.data);
        } catch (error) {
            console.log("Error fetching bids:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const { toast, showToast } = useToast();
    const animatingCards = useCardAnimations(bids);

    const handleAccept = async (bidId, expireTime) => {
        try {
            console.log('====================================');
            console.log({ bidId, expireTime });
            console.log('====================================');
            const response = await api.acceptBid(bidId, { expire_time: expireTime });
            console.log("Bid accepted successfully:", response.data);
            showToast("Bid accepted successfully!", "accepted");
            navigate("/load")
        } catch (error) {
            console.log("Error accepting bid:", error);
        }
    };

    const handleDecline = (bidId) => {
        showToast("Bid declined successfully!", "declined");
    };

    const handleBackClick = () => {
        console.log("Back button clicked");
        // Handle navigation back
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BidListHeader onBackClick={handleBackClick} />

            <BidListContainer
                bids={bids}
                onAccept={handleAccept}
                onDecline={handleDecline}
                animatingCards={animatingCards}
            />

            <ToastNotification toast={toast} />
        </div>
    );
};

export default BidListPage;