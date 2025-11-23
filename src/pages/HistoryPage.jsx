import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserInterviews } from '../services/interviewService';

const HistoryPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            getUserInterviews(currentUser.uid)
                .then((data) => {
                    console.log('Fetched interviews:', data);
                    setInterviews(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [currentUser, location.search]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Interview History 📚</h2>
                    <p className="text-gray-600 mt-1">Review your past interview sessions</p>
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-md"
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading interviews...</p>
                </div>
            ) : interviews.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="text-6xl mb-4">🎤</div>
                    <p className="text-gray-600 text-lg mb-4">No interviews yet!</p>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                        onClick={() => navigate('/dashboard')}
                    >
                        Start Your First Interview
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Topic</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Duration</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {interviews.map((interview) => (
                                <tr key={interview.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{interview.topic}</td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {interview.createdAt?.seconds
                                            ? new Date(interview.createdAt.seconds * 1000).toLocaleDateString()
                                            : 'Just now'}
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {Math.floor(interview.duration / 60)}m {interview.duration % 60}s
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
