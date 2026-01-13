import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Feed = () => {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchGigs();
    }, []);

    const fetchGigs = async (search = '') => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/gigs?search=${search}`);
            setGigs(data);
        } catch (error) {
            console.error('Error fetching gigs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchGigs(searchTerm);
    };

    return (
        <div>
            {/* Search Hero */}
            <div className="mb-12 text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 bg-gradient-to-b from-white to-gray-50">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">
                    Find the perfect <span className="text-primary">freelance services</span> <br /> for your business
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8 font-light">
                    GigFlow connects you with top talent. Post a job or find work that fits your skills.
                </p>
                <form onSubmit={handleSearch} className="mt-8 flex justify-center max-w-xl mx-auto px-4">
                    <div className="flex w-full shadow-lg rounded-lg overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search for gigs..."
                            className="flex-grow px-6 py-4 border-none outline-none text-gray-700 bg-white focus:ring-2 focus:ring-inset focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="bg-primary text-white px-8 py-4 font-semibold hover:bg-teal-700 transition-colors">
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Gigs Grid */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Latest Opportunities</h2>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : gigs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No gigs found matching your criteria.</p>
                        {user && (
                            <Link to="/gigs/create" className="text-primary font-medium mt-2 inline-block hover:underline">
                                Post a Job
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gigs.map((gig) => (
                            <Link to={`/gigs/${gig._id}`} key={gig._id} className="block group">
                                <div className={`card h-full hover:shadow-md transition-all duration-300 border-gray-100 flex flex-col ${gig.bidCount > 0 ? 'border-l-4 border-l-purple-500' : 'hover:border-primary/20'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex space-x-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${gig.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {gig.status}
                                            </span>
                                            {gig.bidCount > 0 && (
                                                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 text-purple-700 flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                    {gig.bidCount} {gig.bidCount === 1 ? 'Bid' : 'Bids'}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-gray-400 text-xs">
                                            {new Date(gig.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {gig.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                                        {gig.description}
                                    </p>
                                    <div className="flex justify-between items-center pt-5 border-t border-gray-50">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">Budget</p>
                                            <span className="font-bold text-slate-900 text-lg">${gig.budget}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 mb-0.5">Client</p>
                                            <span className="text-sm text-gray-600 font-medium truncate max-w-[100px] block">
                                                {gig.ownerId?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
