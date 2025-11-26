import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex flex-col items-center text-center">
                <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-gray-900/50 border border-gray-700 backdrop-blur-sm">
                    <span className="text-sm font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-blue-400">
                        ✨ AI-Powered Interview Prep
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                    Master Your Next <br />
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">
                        Technical Interview
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
                    Practice with our advanced AI interviewer. Get real-time feedback on your technical knowledge, communication skills, and confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link
                        to="/register"
                        className="px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
                    >
                        Get Started Free
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-4 rounded-xl bg-gray-900 text-white font-bold text-lg border border-gray-700 hover:bg-gray-800 transition-all transform hover:scale-105"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full text-left">
                    <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl mb-6">
                            🎤
                        </div>
                        <h3 className="text-xl font-bold mb-3">Voice Interviews</h3>
                        <p className="text-gray-400">
                            Speak naturally with our AI. It listens, understands, and asks follow-up questions just like a real interviewer.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl mb-6">
                            📊
                        </div>
                        <h3 className="text-xl font-bold mb-3">Detailed Feedback</h3>
                        <p className="text-gray-400">
                            Get comprehensive reports on your performance, including technical accuracy, clarity, and confidence scores.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800 backdrop-blur-sm hover:border-pink-500/30 transition-colors">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center text-2xl mb-6">
                            🎯
                        </div>
                        <h3 className="text-xl font-bold mb-3">Targeted Practice</h3>
                        <p className="text-gray-400">
                            Choose from specific topics like React, Node.js, or System Design to focus your preparation where it matters most.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
