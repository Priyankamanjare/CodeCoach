import React from 'react';
import { useNavigate } from 'react-router-dom';
import topics from '../data/topics';

const DashboardPage = () => {
    const navigate = useNavigate();

    const getNeonColor = (index) => {
        const colors = ['blue', 'purple', 'green', 'orange'];
        return colors[index % colors.length];
    };

    const getIcon = (title) => {
        if (title.includes('Software')) return '</>';
        if (title.includes('Product')) return '📊';
        if (title.includes('Behavioral')) return '💬';
        if (title.includes('Data')) return '💾';
        return '🚀';
    };

    return (
        <div className="min-h-[calc(100vh-64px)]">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-12">
                    <div className="flex-1 w-full text-center md:text-left z-10 pt-4 md:pt-10 ">
                        <h1 className="text-3xl md:text-4xl text-center md:text-left font-extrabold tracking-tight text-white mb-6 leading-tight">
                            Master Your Next Interview.<br />
                            Powered by
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300"> AI.</span>
                        </h1>
                        <p className="text-xl text-gray-400 text-center md:text-left mb-8 max-w-lg leading-relaxed mx-auto md:mx-0">
                            Gain confidence with realistic mock interviews, real-time feedback, and personalized coaching. Your dream job awaits.
                        </p>
                        <button
                            onClick={() => document.getElementById('topics').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-full shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105"
                        >
                            Start Practicing Free
                        </button>
                    </div>
                    <div className="flex-1 w-full relative z-10 flex justify-center">
                        <div className="relative w-80 h-80 md:w-96 md:h-96">
                            <div className="absolute inset-0 bg-blue-500/35 rounded-full blur-3xl animate-pulse"></div>
                            <img
                                src="/robot_hero_new.png"
                                alt="AI Robot Assistant"
                                className="relative w-full h-full object-contain drop-shadow-2xl animate-float"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Topics Section */}
            <div id="topics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <h2 className="text-2xl font-bold text-white text-center md:text-left mb-8">Popular Topic Tracks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topics.map((topic, index) => {
                        const color = getNeonColor(index);
                        return (
                            <div
                                key={topic.id}
                                onClick={() => navigate(`/topic/${topic.id}`)}
                                className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group neon-border-${color}`}
                            >
                                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                                    {getIcon(topic.title)}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                    {topic.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {topic.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
