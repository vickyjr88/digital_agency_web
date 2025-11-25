import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={28} />
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:opacity-90"
            >
              Dexter
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link to="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link to="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
