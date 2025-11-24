import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFeedbackReport } from '../services/interviewService';

const ReportPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            getFeedbackReport(id)
                .then(setReport)
                .catch((err) => {
                    console.error(err);
                    setError("Failed to load report.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
    );

    if (error || !report) return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
            <p className="text-gray-400 mb-6">We couldn't find the feedback report you're looking for.</p>
            <button
                onClick={() => navigate('/history')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Back to History
            </button>
        </div>
    );

    const ScoreCard = ({ title, score, color }) => (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-700 flex flex-col items-center">
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-2">{title}</h3>
            <div className={`text-4xl font-bold text-${color}-400 mb-2`}>{score}/5</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                    className={`bg-${color}-500 h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${(score / 5) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-6 pt-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Interview Report 📊</h1>
                        <p className="text-gray-400 mt-1">
                            Topic: <span className="font-semibold text-gray-200">{report.topic}</span> •
                            Date: {report.createdAt?.seconds ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/history')}
                        className="text-gray-300 hover:text-white font-medium flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 shadow-sm hover:shadow transition"
                    >
                        ← Back to History
                    </button>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <ScoreCard title="Technical" score={report.technicalScore} color="blue" />
                    <ScoreCard title="Communication" score={report.communicationScore} color="purple" />
                    <ScoreCard title="Confidence" score={report.confidenceScore || 0} color="green" />
                    <ScoreCard title="Structure" score={report.structureScore || 0} color="orange" />
                </div>

                {/* Suggestions Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-700 p-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        💡 Suggestions for Improvement
                    </h2>
                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {report.suggestions}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
