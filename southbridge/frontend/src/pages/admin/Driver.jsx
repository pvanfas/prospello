import React, { useState, useEffect, useCallback } from 'react';
import { getDrivers, getDriverDetail, deactivateDriver, deleteDriver, verifyDriver, rejectDriver } from '../../services/adminApi';
import { 
  Search,
  Truck,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Plus,
  X,
  MapPin,
  Star,
  Package,
  ShoppingCart,
  Shield,
  Clock
} from 'lucide-react';

export default function DriverManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: currentPage * 20,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        verification_status: verificationFilter !== 'all' ? verificationFilter : undefined
      };
      
      const data = await getDrivers(params);
      setDrivers(data || []);
      setTotalDrivers((data || []).length);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to fetch drivers. Please try again.');
      setDrivers([]);
      setTotalDrivers(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, verificationFilter]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchDrivers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchDrivers]);

  const handleViewDriver = async (driverId) => {
    try {
      const driverDetail = await getDriverDetail(driverId);
      setSelectedDriver(driverDetail);
    } catch (err) {
      console.error('Error fetching driver detail:', err);
      setError('Failed to fetch driver details.');
    }
  };

  const handleDeactivateDriver = async (driverId) => {
    try {
      await deactivateDriver(driverId);
      setSuccess('Driver deactivated successfully');
      fetchDrivers();
      setSelectedDriver(null);
    } catch (err) {
      console.error('Error deactivating driver:', err);
      setError('Failed to deactivate driver.');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to permanently delete this driver? This action cannot be undone.')) {
      try {
        await deleteDriver(driverId);
        setSuccess('Driver deleted permanently');
        fetchDrivers();
        setSelectedDriver(null);
      } catch (err) {
        console.error('Error deleting driver:', err);
        setError('Failed to delete driver.');
      }
    }
  };

  const handleVerifyDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to verify this driver?')) {
      try {
        await verifyDriver(driverId);
        setSuccess('Driver verified successfully');
        fetchDrivers();
        // Update selected driver if it's the same
        if (selectedDriver && selectedDriver.id === driverId) {
          setSelectedDriver({ ...selectedDriver, verification_status: 'verified' });
        }
      } catch (err) {
        console.error('Error verifying driver:', err);
        setError('Failed to verify driver.');
      }
    }
  };

  const handleRejectDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to reject this driver?')) {
      try {
        await rejectDriver(driverId);
        setSuccess('Driver rejected successfully');
        fetchDrivers();
        // Update selected driver if it's the same
        if (selectedDriver && selectedDriver.id === driverId) {
          setSelectedDriver({ ...selectedDriver, verification_status: 'rejected' });
        }
      } catch (err) {
        console.error('Error rejecting driver:', err);
        setError('Failed to reject driver.');
      }
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handleVerificationFilter = (verification) => {
    setVerificationFilter(verification);
    setCurrentPage(0);
  };

  const DriverCard = ({ driver, onView, onVerify, onReject }) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'online': return 'bg-green-100 text-green-700';
        case 'offline': return 'bg-slate-100 text-slate-600';
        case 'busy': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-slate-100 text-slate-600';
      }
    };

    const getVerificationColor = (status) => {
      switch (status) {
        case 'verified': return 'bg-green-100 text-green-700';
        case 'pending': return 'bg-yellow-100 text-yellow-700';
        case 'rejected': return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-600';
      }
    };

    return (
      <div
        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-slate-900 truncate">{driver.license_number}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  driver.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {driver.is_active ? '● Active' : '● Inactive'}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                  {driver.status}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(driver.verification_status)}`}>
                  {driver.verification_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 font-medium">Vehicle:</span>
              <span className="text-slate-700 font-medium">{driver.vehicle_type}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 font-medium">Capacity:</span>
              <span className="text-slate-700 font-mono text-xs">{driver.max_weight_capacity} kg</span>
            </div>

            {driver.vehicle_registration && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Reg:</span>
                <span className="text-slate-700 font-mono text-xs">{driver.vehicle_registration}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{driver.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>@{driver.username}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{driver.phone_number}</span>
            </div>

            {driver.current_city && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>{driver.current_city}, {driver.current_state}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">Bids</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{driver.total_bids || 0}</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-700 font-medium">Orders</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">{driver.total_orders || 0}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-slate-700">{driver.rating || 0}</span>
              <span className="text-xs text-slate-500">({driver.total_trips || 0} trips)</span>
            </div>
            <div className="text-xs text-slate-500">
              {driver.available_capacity}kg available
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(driver.created_at)}</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onView(driver.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Eye className="w-3 h-3" />
              View Details
            </button>
            
            {driver.verification_status === 'pending' && (
              <>
                <button
                  onClick={() => onVerify(driver.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  Verify
                </button>
                <button
                  onClick={() => onReject(driver.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DetailModal = ({ driver, onClose, handleDeactivateDriver, handleDeleteDriver }) => {
    if (!driver) return null;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'online': return 'bg-green-500 text-white';
        case 'offline': return 'bg-slate-500 text-white';
        case 'busy': return 'bg-yellow-500 text-white';
        default: return 'bg-slate-500 text-white';
      }
    };

    const getVerificationColor = (status) => {
      switch (status) {
        case 'verified': return 'bg-green-500 text-white';
        case 'pending': return 'bg-yellow-500 text-white';
        case 'rejected': return 'bg-red-500 text-white';
        default: return 'bg-slate-500 text-white';
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{driver.license_number}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    driver.is_active 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-500 text-white'
                  }`}>
                    {driver.is_active ? '● Active' : '● Inactive'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                    {driver.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(driver.verification_status)}`}>
                    {driver.verification_status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Vehicle Information</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Vehicle Type</div>
                    <div className="text-sm text-slate-900">{driver.vehicle_type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Max Weight Capacity</div>
                    <div className="text-sm text-slate-900">{driver.max_weight_capacity} kg</div>
                  </div>
                  {driver.max_volume_capacity && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Max Volume Capacity</div>
                      <div className="text-sm text-slate-900">{driver.max_volume_capacity} m³</div>
                    </div>
                  )}
                  {driver.vehicle_registration && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Registration</div>
                      <div className="text-sm text-slate-900 font-mono">{driver.vehicle_registration}</div>
                    </div>
                  )}
                  {driver.insurance_number && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Insurance</div>
                      <div className="text-sm text-slate-900 font-mono">{driver.insurance_number}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Contact Details</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Email</div>
                    <div className="text-sm text-slate-900">{driver.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Phone</div>
                    <div className="text-sm text-slate-900">{driver.phone_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Username</div>
                    <div className="text-sm text-slate-900">@{driver.username}</div>
                  </div>
                  {driver.current_city && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Location</div>
                      <div className="text-sm text-slate-900">{driver.current_city}, {driver.current_state}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Payment Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {driver.upi_id && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">UPI ID</div>
                    <div className="text-sm text-slate-900 font-mono">{driver.upi_id}</div>
                  </div>
                )}
                {driver.bank_account_number && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Bank Account</div>
                    <div className="text-sm text-slate-900 font-mono">{driver.bank_account_number}</div>
                  </div>
                )}
                {driver.ifsc_code && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">IFSC Code</div>
                    <div className="text-sm text-slate-900 font-mono">{driver.ifsc_code}</div>
                  </div>
                )}
                {driver.account_holder_name && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Account Holder</div>
                    <div className="text-sm text-slate-900">{driver.account_holder_name}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Performance Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">Total Bids</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{driver.total_bids || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                    <span className="text-sm text-slate-600">Total Orders</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-900">{driver.total_orders || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">Rating</span>
                  </div>
                  <div className="text-3xl font-bold text-green-900">{driver.rating || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-slate-600">Total Trips</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-900">{driver.total_trips || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Registration Date</h3>
              </div>
              <div className="text-sm text-slate-700">{formatDate(driver.created_at)}</div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleDeactivateDriver(driver.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Deactivate
              </button>
              <button 
                onClick={() => handleDeleteDriver(driver.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Driver Management</h1>
              <p className="text-slate-600 mt-2">Manage and monitor all drivers in the system</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Add Driver
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Drivers</p>
                <p className="text-2xl font-bold text-slate-900">{totalDrivers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Verified</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(drivers || []).filter(d => d.verification_status === 'verified').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Online</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(drivers || []).filter(d => d.status === 'online').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Rating</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(drivers || []).length > 0 ? ((drivers || []).reduce((sum, d) => sum + (d.rating || 0), 0) / (drivers || []).length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search drivers by license, vehicle, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={verificationFilter}
                onChange={(e) => handleVerificationFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Drivers Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(drivers || []).map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onView={handleViewDriver}
                onVerify={handleVerifyDriver}
                onReject={handleRejectDriver}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (drivers || []).length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No drivers found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedDriver && (
          <DetailModal
            driver={selectedDriver}
            onClose={() => setSelectedDriver(null)}
            handleDeactivateDriver={handleDeactivateDriver}
            handleDeleteDriver={handleDeleteDriver}
          />
        )}
      </div>
    </div>
  );
}