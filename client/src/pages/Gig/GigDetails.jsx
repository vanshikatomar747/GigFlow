import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const GigDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [gig, setGig] = useState(null);
    const [bids, setBids] = useState([]);
    const [myBid, setMyBid] = useState(null);
    const [loading, setLoading] = useState(true);

    // Bid Form State
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [bidError, setBidError] = useState('');

    // Derived state
    const isOwner = user && gig && user._id === gig.ownerId?._id;
    const hasBidded = !!myBid;
    const isAssigned = gig?.status === 'Assigned';

    useEffect(() => {
        const fetchGigData = async () => {
            try {
                const { data: gigData } = await axios.get(`/api/gigs/${id}`);
                setGig(gigData);

                // If owner, fetch bids
                if (user && gigData.ownerId._id === user._id) {
                    const { data: bidsData } = await axios.get(`/api/bids/${id}`);
                    setBids(bidsData);
                } else if (user) {
                    // Check if user has already bid
                    const { data: myBidData } = await axios.get(`/api/bids/check/${id}`);
                    setMyBid(myBidData);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchGigData();
    }, [id, user]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/bids', {
                gigId: id,
                message,
                price: Number(price)
            });
            alert('Bid placed successfully!');
            navigate('/'); // Redirect to home or refresh component
        } catch (err) {
            setBidError(err.response?.data?.message || 'Failed to place bid');
        }
    };

    const handleHire = async (bidId) => {
        if (!window.confirm('Are you sure you want to hire this freelancer? This action cannot be undone.')) return;

        try {
            await axios.patch(`/api/bids/${bidId}/hire`);
            alert('Freelancer hired successfully!');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || 'Hiring failed');
        }
    };

    if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!gig) return <div className="text-center mt-20">Gig not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Gig Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">{gig.title}</h1>
                        <p className="text-gray-500">
                            Posted by <span className="font-medium text-primary">{gig.ownerId.name}</span> • {new Date(gig.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold text-sm ${gig.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {gig.status}
                    </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{gig.description}</p>
                </div>

                <div className="flex items-center text-lg">
                    <span className="font-medium text-gray-500 mr-2">Budget:</span>
                    <span className="font-bold text-slate-900 text-2xl">${gig.budget}</span>
                </div>
            </div>

            {/* Client View: Manage Bids */}
            {isOwner && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Received Bids ({bids.length})</h2>
                    {bids.length === 0 ? (
                        <p className="text-gray-500 italic">No bids yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {bids.map((bid) => (
                                <div key={bid._id} className={`border rounded-xl p-6 transition-colors ${bid.status === 'Hired' ? 'bg-green-50 border-green-200' : 'border-gray-100 hover:border-primary/30'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                                                {bid.freelancerId?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{bid.freelancerId?.name}</h4>
                                                <p className="text-sm text-gray-500">{bid.freelancerId?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-lg text-slate-900">${bid.price}</span>
                                            <span className={`text-xs font-bold uppercase ${bid.status === 'Hired' ? 'text-green-600' :
                                                bid.status === 'Rejected' ? 'text-red-500' : 'text-yellow-600'
                                                }`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-50 text-sm">
                                        {bid.message}
                                    </p>

                                    {gig.status === 'Open' && bid.status === 'Pending' && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleHire(bid._id)}
                                                className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-6"
                                            >
                                                Hire {bid.freelancerId?.name.split(' ')[0]}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Freelancer View: Place Bid */}
            {!isOwner && user && gig.status === 'Open' && !hasBidded && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Place a Bid</h2>
                    {bidError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{bidError}</div>}
                    <form onSubmit={handleBidSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Price ($)</label>
                            <input
                                type="number"
                                placeholder="500"
                                className="input-field"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                            <textarea
                                rows="4"
                                placeholder="Explain why you are the best fit for this job..."
                                className="input-field py-3"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn-primary w-full">Submit Proposal</button>
                    </form>
                </div>
            )}

            {/* Status Messages for Freelancers */}
            {!isOwner && hasBidded && myBid && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Proposal</h2>
                    <div className={`border rounded-xl p-6 transition-colors ${myBid.status === 'Hired' ? 'bg-green-50 border-green-200' : 'border-gray-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${myBid.status === 'Hired' ? 'bg-green-100 text-green-700' :
                                    myBid.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {myBid.status}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-lg text-slate-900">${myBid.price}</span>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm whitespace-pre-wrap">
                            {myBid.message}
                        </p>
                    </div>
                </div>
            )}

            {!isOwner && gig.status === 'Assigned' && (
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center mt-6">
                    <p className="text-gray-500 font-medium">This gig is no longer accepting proposals.</p>
                </div>
            )}
        </div>
    );
};

export default GigDetails;
