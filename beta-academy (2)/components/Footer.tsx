
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a192f] text-white py-24 px-4 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-amber-400/20">
                <span className="text-[#0a192f] font-black text-xl">B</span>
              </div>
              <span className="text-xl font-black tracking-tighter">BETA ACADEMY</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Empowering students through innovative learning methods and expert guidance since 2010. National leader in JEE & NEET coaching.
            </p>
          </div>
          
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-amber-400 mb-8">Quick Links</h4>
            <ul className="space-y-4 text-white/50 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Elite Programs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Scholarship 2024</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Alumni Success</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Admissions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-amber-400 mb-8">Legal</h4>
            <ul className="space-y-4 text-white/50 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Child Safety</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-amber-400 mb-8">Contact Us</h4>
            <ul className="space-y-5 text-white/50 text-sm font-medium">
              <li className="flex items-start">
                <span className="text-amber-400 mr-4">📍</span> 123 Education Hub, Sector 45, New Delhi
              </li>
              <li className="flex items-center">
                <span className="text-amber-400 mr-4">📞</span> +91 98765 43210
              </li>
              <li className="flex items-center">
                <span className="text-amber-400 mr-4">✉️</span> admissions@betaacademy.edu
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-white/30 text-[10px] font-black uppercase tracking-widest">
          <p>© 2024 Beta Academy Institute. All rights reserved.</p>
          <div className="flex space-x-8 mt-6 sm:mt-0">
            <a href="#" className="hover:text-amber-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Facebook</a>
            <a href="#" className="hover:text-amber-400 transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
