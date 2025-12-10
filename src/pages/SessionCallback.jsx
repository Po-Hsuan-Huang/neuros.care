import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const SessionCallback = () => {
    const { refreshUser } = useUserContext(); // needs the refreshUser from updated UserContext
    const navigate = useNavigate();

    useEffect(() => {
        // Refresh user data from backend session
        refreshUser();

        // Redirect to profile/dashboard after login completes
        const timer = setTimeout(() => {
            navigate('/profile');
        }, 500);

        return () => clearTimeout(timer);
    }, [navigate, refreshUser]);

    return (
        <div>
            Signing you in... (almost done)
        </div>
    );
};

export default SessionCallback;
