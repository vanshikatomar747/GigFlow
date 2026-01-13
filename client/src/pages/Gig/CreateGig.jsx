import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateGig = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/gigs', {
                title,
                description,
                budget: Number(budget),
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create gig');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Post a New Job</h2>
            <div className="card">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Build a React Website"
                            className="input-field"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Keep it short and descriptive.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows="6"
                            placeholder="Describe the project details, requirements, and deliverables..."
                            className="input-field py-3 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                placeholder="500"
                                className="input-field pl-8"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={() => navigate('/')} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Post Job</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGig;
