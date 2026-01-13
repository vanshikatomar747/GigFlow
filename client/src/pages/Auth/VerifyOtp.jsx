import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth(); // We might need to manually set user if verification returns token

    useEffect(() => {
        // specific check for location.state
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/auth/verify-otp', { email, otp });

            // Verification successful
            setSuccess('Email verified successfully! Redirecting...');

            // Login the user with the token received
            localStorage.setItem('userInfo', JSON.stringify(data));
            // We need to update auth context, but direct access might be tricky if not exposed
            // If we reload, AuthContext will pick it up from localStorage

            setTimeout(() => {
                window.location.href = '/profile'; // Force reload/redirect to pick up auth state
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <div className="card">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Verify Your Email</h2>

                {location.state?.message && !error && !success && (
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {location.state.message}
                    </div>
                )}

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="input-field bg-gray-50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code (OTP)</label>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="input-field text-center tracking-widest text-lg font-mono"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength="6"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full py-2.5"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        <Link to="/login" className="text-primary hover:underline font-medium">Back to Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
