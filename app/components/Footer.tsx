import React from 'react';

const Footer: React.FC = () => {
  return (
        <footer className="bg-[#1a1a1a] text-gray-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <p className="text-sm">&copy; 2025 AdeptProductions All rights reserved.</p>
            <a
            href="/contact"
            className="text-gray-300 hover:text-white transition-colors duration-200 underline"
            >
            Contact Me
            </a>
        </div>
        </footer>
  );
};

export default Footer;
