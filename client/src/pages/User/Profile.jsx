import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [gigs, setGigs] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // Only fetch if user fits role critera
            if (!user) return;

            try {
                setLoading(true);
                if (user?.role === 'freelancer') {
                    const { data } = await axios.get('/api/bids/my-bids');
                    setMyBids(data);
                } else {
                    const { data } = await axios.get('/api/gigs/my-gigs');
                    setGigs(data);
                }
            } catch (err) {
                console.error(err);
                // Don't show error if it's just no data
                if (err.response?.status !== 404) {
                    setError(err.response?.data?.message || 'Failed to fetch profile data');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            setEditName(user.name);
            fetchData();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdateProfile = async () => {
        if (!editName.trim()) return;

        try {
            setUpdateLoading(true);
            const { data } = await axios.put('/api/users/profile', {
                name: editName
            });

            // Update context and local storage
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this gig?')) {
            try {
                await axios.delete(`/api/gigs/${id}`);
                setGigs(gigs.filter(gig => gig._id !== id));
            } catch (error) {
                console.error(error);
                alert('Failed to delete gig');
            }
        }
    };

    const handleMarkAsClosed = async (id) => {
        try {
            await axios.patch(`/api/gigs/${id}/status`, { status: 'Closed' });
            setGigs(gigs.map(gig =>
                gig._id === id ? { ...gig, status: 'Closed' } : gig
            ));
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
            window.location.reload();
        }
    };

    if (loading && !user) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="ml-4 mb-2">
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-bold text-slate-800"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-3xl font-bold text-slate-800">{user?.name}</h1>
                                )}
                                <div className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                    <span>{user?.email}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                    <span className="uppercase font-semibold tracking-wide text-xs">{user?.role}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mb-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={updateLoading}
                                        className="btn-primary flex items-center gap-2 text-sm"
                                    >
                                        {updateLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditName(user?.name);
                                        }}
                                        disabled={updateLoading}
                                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-white text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Edit Profile
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium text-sm"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
            </div>}

            {/* Dashboard Content */}
            {user?.role === 'freelancer' ? (
                /* Freelancer View */
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">My Applications</h2>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{myBids.length} Active</span>
                    </div>

                    {myBids.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No applications yet</h3>
                            <p className="text-gray-500 mb-6">Start exploring gigs and find your next opportunity.</p>
                            <Link to="/" className="btn-primary inline-flex items-center gap-2">
                                Browse Jobs
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {myBids.map((bid) => (
                                <div
                                    key={bid._id}
                                    className={`rounded-xl shadow-sm border p-6 transition-all duration-200 group ${bid.status === 'Hired'
                                        ? 'bg-gradient-to-br from-green-50 to-white border-green-200 shadow-md ring-1 ring-green-100'
                                        : 'bg-white border-gray-100 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">
                                                    {bid.gigId?.title || 'Gig Removed'}
                                                </h3>
                                                {bid.status === 'Hired' && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        HIRED
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                Applied on {new Date(bid.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {bid.status !== 'Hired' && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${bid.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Your Bid</p>
                                            <p className={`text-2xl font-bold ${bid.status === 'Hired' ? 'text-green-700' : 'text-slate-900'}`}>${bid.price}</p>
                                        </div>
                                        {bid.status === 'Hired' ? (
                                            <Link to={`/gigs/${bid.gigId?._id}`} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm">
                                                View Active Job
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                            </Link>
                                        ) : (
                                            <Link to={`/gigs/${bid.gigId?._id}`} className="text-primary font-medium hover:underline flex items-center gap-1">
                                                View Job Details
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Client View (Default) */
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Posted Jobs</h2>
                        <Link to="/gigs/create" className="btn-primary text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Post New Job
                        </Link>
                    </div>

                    {gigs.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No jobs posted yet</h3>
                            <p className="text-gray-500 mb-6">Create your first gig to start receiving proposals.</p>
                            <Link to="/gigs/create" className="btn-primary">Post a Job</Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {gigs.map((gig) => (
                                <div key={gig._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 mb-1">{gig.title}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                Posted on {new Date(gig.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${gig.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {gig.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                        <div className="text-lg font-bold text-slate-900">
                                            ${gig.budget}
                                        </div>
                                        <div className="flex space-x-3">
                                            <Link to={`/gigs/${gig._id}`} className="text-sm text-gray-600 hover:text-primary font-medium flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                View
                                            </Link>
                                            {gig.status === 'Open' && (
                                                <button
                                                    onClick={() => handleMarkAsClosed(gig._id)}
                                                    className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    Close
                                                </button>
                                            )}
                                            {gig.status !== 'Assigned' && (
                                                <button
                                                    onClick={() => handleDelete(gig._id)}
                                                    className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
