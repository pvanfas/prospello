import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { Plus, MapPin, Truck, Scale, CheckCircle, Clock, Package, ArrowRight } from 'lucide-react';
import CreateLoadModal from "../modal/CreateLoadModal"; // Import CreateLoadModal
import LoadCard from "./LoadCard";
import api from "../../services/api";
import {
    Plus,
    MapPin,
    Truck,
    Scale,
    CheckCircle,
    Clock,
    Package,
    ArrowRight,
    DollarSign,
    Users,
    Trash2,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditLoadModal from "../modal/EditLoadModal";


const EmptyState = ({ onCreateLoad }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
        >
            <div className="mb-4">
                <motion.div
                    className="relative w-16 h-16 mx-auto mb-4"
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
                        <Truck className="w-8 h-8 text-orange-500" />
                    </div>
                </motion.div>

                <h3 className="text-xl font-bold text-gray-800 mb-1">
                    No loads yet
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                    Create your first load to get started with managing
                    shipments.
                </p>

                <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <button
                        onClick={onCreateLoad}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg border-0"
                    >
                        <Plus className="w-4 h-4 mr-1.5 inline" />
                        Create Your First Load
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Add Load Button component
const AddLoadButton = ({ onClick, isSelectionMode, selectedCount, onDeleteSelected, onExitSelection }) => {
    if (isSelectionMode) {
        return (
            <motion.div
                className="fixed bottom-24 right-6 z-40 flex gap-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                }}
            >
                {/* Exit selection button */}
                <motion.button
                    onClick={onExitSelection}
                    className="flex items-center justify-center w-14 h-14 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg transition-all duration-200 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Exit selection"
                >
                    <X className="w-6 h-6" />
                </motion.button>
                
                {/* Delete selected button */}
                <motion.button
                    onClick={onDeleteSelected}
                    disabled={selectedCount === 0}
                    className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 group ${
                        selectedCount > 0 
                            ? "bg-red-500 hover:bg-red-600 text-white" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    whileHover={{ scale: selectedCount > 0 ? 1.05 : 1 }}
                    whileTap={{ scale: selectedCount > 0 ? 0.95 : 1 }}
                    aria-label="Delete selected loads"
                >
                    <Trash2 className="w-6 h-6" />
                </motion.button>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="fixed bottom-24 right-6 z-40" // Increased bottom margin
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
            }}
        >
            <motion.button
                onClick={onClick}
                className="flex items-center justify-center w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-200 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add new load"
            >
                <Plus className="w-6 h-6" />
            </motion.button>
        </motion.div>
    );
};

// Main LoadListPage component optimized for mobile
const LoadListPage = () => {
    const [loads, setLoads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState(null);
    const [page, setPage] = useState(0); // Track the current page
    const [hasMore, setHasMore] = useState(true); // Track if more loads are available
    const navigate = useNavigate();
    
    // Selection mode state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedLoadIds, setSelectedLoadIds] = useState(new Set());
    const [deleting, setDeleting] = useState(false);
    
    const fetchLoad = async () => {
        try {
            const response = await api.get(
                `/v1/load/my-loads?skip=${page * 20}&limit=20`
            );
            console.log(response.data);
            
            const newLoads = response.data;
            if (newLoads.length === 0) {
                setHasMore(false); // No more loads to fetch
            } else {
                setLoads((prevLoads) => [...prevLoads, ...newLoads]); // Append new loads
                setPage((prevPage) => prevPage + 1); // Increment page
            }
        } catch (error) {
            console.error("Failed to fetch loads:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fresh fetch function that replaces the entire load list (for after creating new loads)
    const fetchLoads = async () => {
        try {
            setLoading(true);
            const response = await api.get(
                `/v1/load/my-loads?skip=0&limit=20`
            );
            console.log("Fresh fetch loads:", response.data);
            
            const newLoads = response.data;
            setLoads(newLoads); // Replace entire list
            setPage(1); // Reset to page 1 (since we fetched page 0)
            setHasMore(newLoads.length === 20); // Set hasMore based on whether we got a full page
        } catch (error) {
            console.error("Failed to fetch loads:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load fetch
    useEffect(() => {
        const fetchInitialLoads = async () => {
            if (!hasMore) return; // Stop fetching if no more loads are available

            setLoading(true);
            fetchLoad();
        };

        fetchInitialLoads();
    }, [page, hasMore]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100 // Trigger 100px before bottom
            ) {
                if (!loading && hasMore) {
                    setPage((prevPage) => prevPage + 1); // Trigger next page load
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    const handleEditLoad = (load) => {
        setSelectedLoad(load);
        setShowEditModal(true);
        console.log("Edit load:", load);
    };

    const handleAcceptBid = (load) => {
        navigate(`/load/${load.id}`);
        console.log("Accept bid for load:", load);
    };

    const handleCreateLoad = () => {
        setShowCreateModal(true);
        console.log("Opening Create Load Modal...");
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedLoad(null);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    // Selection mode handlers
    const handleEnterSelectionMode = () => {
        setIsSelectionMode(true);
        setSelectedLoadIds(new Set());
    };

    const handleExitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedLoadIds(new Set());
    };

    const handleToggleLoadSelection = (loadId) => {
        setSelectedLoadIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(loadId)) {
                newSet.delete(loadId);
            } else {
                newSet.add(loadId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedLoadIds.size === loads.length) {
            setSelectedLoadIds(new Set());
        } else {
            setSelectedLoadIds(new Set(loads.map(load => load.id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedLoadIds.size === 0) return;
        
        setDeleting(true);
        try {
            const response = await api.post('/v1/load/delete/loads/', {
                load_ids: Array.from(selectedLoadIds)
            });
            
            if (response.status === 200) {
                // Remove deleted loads from the list
                setLoads(prevLoads => 
                    prevLoads.filter(load => !selectedLoadIds.has(load.id))
                );
                // Exit selection mode
                handleExitSelectionMode();
            }
        } catch (error) {
            console.error('Failed to delete loads:', error);
            // You might want to show a toast notification here
        } finally {
            setDeleting(false);
        }
    };

    if (loading && loads.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-3">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-7 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="h-40 bg-gray-200 rounded-xl"
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
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto p-3">
                {/* Compact Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                                {isSelectionMode ? `Selected (${selectedLoadIds.size})` : "My Loads"}
                            </h1>
                            <p className="text-gray-600 text-sm md:text-base">
                                {isSelectionMode 
                                    ? "Select loads to delete" 
                                    : "Manage and track your shipments."
                                }
                            </p>
                        </div>
                        
                        <div className="flex gap-2">
                            {!isSelectionMode && loads.length > 0 && (
                                <motion.button
                                    onClick={handleEnterSelectionMode}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Select Mode
                                </motion.button>
                            )}
                            
                            {isSelectionMode && loads.length > 0 && (
                                <motion.button
                                    onClick={handleSelectAll}
                                    className="text-sm font-medium text-orange-600 hover:text-orange-700 px-3 py-1 rounded-md hover:bg-orange-50 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {selectedLoadIds.size === loads.length ? "Deselect All" : "Select All"}
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 w-12 h-0.5 bg-orange-500 rounded-full"></div>
                </motion.div>

                {/* Load Cards Grid - Mobile optimized */}
                {loads.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {loads.map((load, index) => (
                                <LoadCard
                                    key={load.id}
                                    load={load}
                                    index={index}
                                    onEdit={handleEditLoad}
                                    onAcceptBid={handleAcceptBid}
                                    isSelectionMode={isSelectionMode}
                                    isSelected={selectedLoadIds.has(load.id)}
                                    onToggleSelection={() => handleToggleLoadSelection(load.id)}
                                    onEnterSelectionMode={handleEnterSelectionMode}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <EmptyState onCreateLoad={handleCreateLoad} />
                )}

                {/* Loading indicator for pagination */}
                {loading && loads.length > 0 && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {/* Add Load Button - Always visible at the bottom */}
                <AddLoadButton 
                    onClick={handleCreateLoad}
                    isSelectionMode={isSelectionMode}
                    selectedCount={selectedLoadIds.size}
                    onDeleteSelected={handleDeleteSelected}
                    onExitSelection={handleExitSelectionMode}
                />

                {/* Create Load Modal */}
                <CreateLoadModal
                    open={showCreateModal}
                    onOpenChange={handleCloseCreateModal}
                    fetchLoads={fetchLoad}
                />

                {/* Edit Load Modal */}
                <EditLoadModal
                    open={showEditModal}
                    onOpenChange={handleCloseEditModal}
                    load={selectedLoad}
                    fetchLoads={fetchLoad}
                />
            </div>
        </div>
    );
};

export default LoadListPage;