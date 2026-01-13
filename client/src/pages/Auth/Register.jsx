import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [role, setRole] = useState('client');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/profile');
        }
    }, [user, navigate]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, role);
            navigate('/verify-otp', { state: { email, message: 'Verification code sent to your email.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 mb-10">
            <div className="card">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Create an Account</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div
                            className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${role === 'client' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                            onClick={() => setRole('client')}
                        >
                            <div className="font-bold text-slate-800">I want to hire</div>
                            <div className="text-xs text-gray-500 mt-1">Client</div>
                        </div>
                        <div
                            className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${role === 'freelancer' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                            onClick={() => setRole('freelancer')}
                        >
                            <div className="font-bold text-slate-800">I want to work</div>
                            <div className="text-xs text-gray-500 mt-1">Freelancer</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Create a password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
