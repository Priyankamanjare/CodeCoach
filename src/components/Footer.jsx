import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-white mb-1">CodeCoach</h3>
                        <p className="text-sm text-gray-400">Master your technical interviews with AI.</p>
                    </div>

                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>

                    <div className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} CodeCoach. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
