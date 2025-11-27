import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';
import BottomNav from '../components/BottomNav';



const PrivateRouter = ({ children }) => {
	const { isAuthenticated,accessToken } = useAuth();
	const [loading, setLoading] = useState(true);
	

	useEffect(() => {
		// Simulate loading for smoothness, replace with actual loading logic if needed
		const timer = setTimeout(() => setLoading(false), 400);
		return () => clearTimeout(timer);
	}, []);

	if (loading) return <Loader />;
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	return (
		<>
			{children}
			<BottomNav />
		</>
	);
};

export default PrivateRouter;
