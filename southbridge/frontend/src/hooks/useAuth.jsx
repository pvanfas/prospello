import { useSelector } from 'react-redux';

const useAuth = () => {
	const { isAuthenticated, user, accessToken, refreshToken } = useSelector(state => state.auth);
	return { isAuthenticated, user, accessToken, refreshToken };
};

export default useAuth;
