import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const SessionCallback = () => {
    const { refreshUser } = useUserContext();
    const navigate = useNavigate();
    // Use a ref to prevent double-firing in React.StrictMode (development)
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const completeLogin = async () => {
            try {
                console.log("Starting user refresh...");
                await refreshUser();
                console.log("User refreshed! Navigating to profile...");
                navigate('/profile', { replace: true }); // 'replace' prevents back-button loops
            } catch (error) {
                console.error("Login failed:", error);
                // Optionally navigate to an error page or login
            }
        };

        completeLogin();
    }, [refreshUser, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Finalizing login...</h2>
            {/* If you have a loading spinner component, put it here */}
        </div>
    );
};

export default SessionCallback;