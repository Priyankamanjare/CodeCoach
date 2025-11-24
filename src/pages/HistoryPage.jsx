import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserInterviews, deleteInterview } from '../services/interviewService';

const HistoryPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            if (currentUser) {
                try {
                    const data = await getUserInterviews(currentUser.uid);
                    setInterviews(data);
                } catch (error) {
                    console.error("Failed to fetch interviews", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchInterviews();
    }, [currentUser, location.search]);

    const handleDelete = async (interviewId, feedbackReportId) => {
        if (window.confirm("Are you sure you want to delete this interview? This action cannot be undone.")) {
            try {
                await deleteInterview(interviewId, feedbackReportId);
                setInterviews(prev => prev.filter(i => i.id !== interviewId));
            } catch (error) {
                console.error("Failed to delete interview", error);
                alert("Failed to delete interview. Please try again.");
            }
        }
    };

    return (
        <div className="p-6 pt-24 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Interview History 📚</h2>
                    <p className="text-gray-400 mt-1">Review your past interview sessions</p>
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
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    <div className="text-6xl mb-4">🎤</div>
                    <p className="text-gray-400 text-lg mb-4">No interviews yet!</p>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                        onClick={() => navigate('/dashboard')}
                    >
                        Start Your First Interview
                    </button>
                </div>
            ) : (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 border-b border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Topic
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {interviews.map((interview) => (
                                <tr key={interview.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white capitalize">{interview.topic}</div>
                                        <div className="text-xs text-gray-400">{interview.duration}s</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                            {new Date(interview.createdAt?.seconds * 1000).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(interview.createdAt?.seconds * 1000).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-yellow-400 mr-1">★</span>
                                            <span className="text-sm text-white font-bold">
                                                {interview.overallScore ? interview.overallScore.toFixed(1) : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            {interview.feedbackReportId && (
                                                <Link
                                                    to={`/report/${interview.feedbackReportId}`}
                                                    className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                                                >
                                                    <span>View Report</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => handleDelete(interview.id, interview.feedbackReportId)}
                                                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-400/10"
                                                title="Delete Interview"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
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
