import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
const BidModal = ({ load, open, onClose, onSubmit }) => {
    const [bidAmount, setBidAmount] = useState("");

    const handleSubmit = () => {
        if (bidAmount && parseFloat(bidAmount) > 0) {
            onSubmit({
                load_id: load.id,
                amount: parseFloat(bidAmount),
            });
            setBidAmount("");
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Place Your Bid
                </h3>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">
                            {load.origin} → {load.destination}
                        </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        Current Bids:{load.lowest_bid || 0}
                        <span className="font-medium">{load.bids_count}</span>
                    </div>
                </div>

                <div>
                    <div className="mb-4">
                        <div className="block text-sm font-medium text-gray-700 mb-2">
                            Your Bid Amount (₹)
                        </div>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder="Enter bid amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Submit Bid
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
export default BidModal;