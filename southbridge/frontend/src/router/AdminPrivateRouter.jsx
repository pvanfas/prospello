import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';

const AdminPrivateRouter = ({ children }) => {
	const { isAuthenticated, user } = useAuth();
	const [loading, setLoading] = useState(true);
	

	useEffect(() => {
		// Simulate loading for smoothness, replace with actual loading logic if needed
		const timer = setTimeout(() => setLoading(false), 400);
		return () => clearTimeout(timer);
	}, []);

	if (loading) return <Loader />;
	
	// Check if user is authenticated AND has admin role
	if (!isAuthenticated || user?.role !== "admin") {
		return <Navigate to="/admin/login" replace />;
	}
	
	return (
		<>
			{children}
		</>
	);
};

export default AdminPrivateRouter;
