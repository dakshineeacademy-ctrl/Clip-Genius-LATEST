
import React from 'react';
import { Scissors, Menu, X, Crown } from 'lucide-react';
import { userService } from '../services/userService';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenUpgrade: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenUpgrade }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const plan = userService.getPlanDetails();
  const isFree = userService.getPlanId() === 'free';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'plans', label: 'Plans' },
    { id: 'about', label: 'About Us' },
  ];

  const legalItems = [
    { id: 'privacy', label: 'Privacy' },
    { id: 'terms', label: 'Terms' },
  ];

  return (
    <nav className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Scissors size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ClipGenius</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentView === item.id ? 'text-brand-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="h-4 w-px bg-dark-600 mx-2"></div>
            
            {legalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-xs font-medium transition-colors ${
                  currentView === item.id ? 'text-gray-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={onOpenUpgrade}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition
                ${isFree 
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-900/50' 
                  : 'bg-dark-800 border border-dark-600 text-gray-300 hover:text-white'}
              `}
            >
              {isFree ? <Crown size={14} /> : null}
              {isFree ? 'Upgrade' : plan.name}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-800 border-b border-dark-700 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {[...navItems, ...legalItems].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  currentView === item.id ? 'bg-dark-700 text-brand-400' : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
               onClick={() => {
                 onOpenUpgrade();
                 setIsMenuOpen(false);
               }}
               className="w-full text-left px-3 py-2 text-base font-bold text-brand-400"
            >
              {isFree ? 'Upgrade to Pro' : 'My Plan'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
