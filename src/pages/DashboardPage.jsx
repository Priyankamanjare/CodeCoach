import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import topics from '../data/topics';

const DashboardPage = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                    Welcome, {currentUser?.displayName || currentUser?.email?.split('@')[0]} 👋
                </h2>
                <button
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition shadow-md"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-gray-700">Start a New Interview 🚀</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer hover:border-blue-400 transition-all group"
                        onClick={() => navigate(`/topic/${topic.id}`)}
                    >
                        <h4 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition">
                            {topic.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">{topic.description}</p>
                        <span className="text-blue-600 font-medium text-sm">Start Interview →</span>
                    </div>
                ))}
            </div>

            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">View Your Past Interviews</h3>
                <p className="text-gray-600 mb-6">Check out your interview history and track your progress</p>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
                    onClick={() => navigate('/history')}
                >
                    View Interview History →
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;
