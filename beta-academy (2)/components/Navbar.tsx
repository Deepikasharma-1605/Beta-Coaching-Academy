
import React from 'react';
import { View, User } from '../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass-nav transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-24">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-all duration-700 transform group-hover:rotate-[360deg] shadow-[0_0_30px_rgba(255,193,7,0.4)] bg-[#ffc107]">
              <span className="font-black text-2xl text-[#050c1a]">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white leading-none">BETA ACADEMY</span>
              <span className="text-[10px] font-black tracking-[0.4em] text-amber-400/90 uppercase mt-1">Elite Excellence</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-12">
            <button className="text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-amber-400 transition-all">Programs</button>
            <button className="text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-amber-400 transition-all">Results</button>
            <button className="text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-amber-400 transition-all">Scholarships</button>
            <button 
              onClick={() => onNavigate('login')}
              className="bg-amber-400 text-[#050c1a] px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all active:scale-95"
            >
              Access Portal
            </button>
          </div>

          {/* Mobile indicator */}
          <div className="lg:hidden">
             <button onClick={() => onNavigate('login')} className="bg-amber-400 p-3 rounded-xl shadow-lg active:scale-90">
                <span className="text-[10px] font-black text-[#050c1a] tracking-widest">PORTAL</span>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
