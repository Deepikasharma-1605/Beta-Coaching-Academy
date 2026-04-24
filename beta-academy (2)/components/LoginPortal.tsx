
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface LoginPortalProps {
  onLogin: (role: UserRole, name: string, email: string) => void;
  onBack: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserId('');
    setPassword('');
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (userId === 'admin@gmail.com' && password === '123456') {
        onLogin(UserRole.ADMIN, "Super Admin", "admin@gmail.com");
        return;
      }

      const collectionName = 
        selectedRole === UserRole.STUDENT ? 'students' : 
        selectedRole === UserRole.FACULTY ? 'faculty' : 
        selectedRole === UserRole.PARENT ? 'parents' : 'admins';
      
      const emailValue = userId.toLowerCase().trim();
      const q = query(
        collection(db, collectionName), 
        where('email', '==', emailValue), 
        where('password', '==', password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        onLogin(selectedRole, userData.name || userData.email, emailValue);
      } else {
        setError("Invalid credentials. Please verify your access ID and password.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: UserRole.STUDENT, label: "Student", icon: "🎓" },
    { id: UserRole.FACULTY, label: "Faculty", icon: "👨‍🏫" },
    { id: UserRole.ADMIN, label: "Admin", icon: "🛡️" }
  ];

  return (
    <div className="min-h-screen bg-[#050c1a] w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic background elements */}
      <div className="glow-orb top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-400/10"></div>
      <div className="glow-orb bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10"></div>
      
      <div className="w-full max-w-[480px] z-10 animate-fade-in">
        <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="bg-[#050c1a] pt-16 pb-10 px-10 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
             <div className="w-20 h-20 bg-amber-400 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl rotate-[15deg] transition-transform hover:rotate-0 duration-500">
                <span className="text-3xl font-black text-[#050c1a]">B</span>
             </div>
             <h2 className="text-3xl font-black text-white tracking-tighter">Secure Gateway</h2>
             <p className="text-amber-400/50 font-black uppercase text-[10px] tracking-[0.5em] mt-3">Identity Management</p>
          </div>
          
          <div className="p-10 md:p-14 bg-white">
            <div className="flex bg-slate-100 p-2 rounded-2xl mb-10 border border-slate-200">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex-1 flex flex-col items-center py-4 rounded-xl transition-all duration-500 ${
                    selectedRole === role.id 
                      ? 'bg-white text-[#050c1a] shadow-xl font-bold scale-[1.02]' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="text-2xl mb-2">{role.icon}</span>
                  <span className="text-[10px] uppercase font-black tracking-widest">{role.label}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-2xl animate-shake">
                <p className="text-xs font-black text-red-600 uppercase tracking-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Username</label>
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="name@betaacademy.edu"
                  className="w-full px-8 py-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-8 focus:ring-amber-400/10 focus:border-amber-400 outline-none transition-all font-bold text-slate-800 text-sm"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Secret Code</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-8 py-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-8 focus:ring-amber-400/10 focus:border-amber-400 outline-none transition-all font-bold text-slate-800 text-sm"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#050c1a] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-slate-900 transition-all shadow-2xl disabled:opacity-50 btn-premium relative group"
              >
                <span className="relative z-10">{loading ? "VERIFYING..." : "ENTER PORTAL"}</span>
                <div className="absolute inset-0 bg-amber-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </button>
            </form>

            <div className="mt-12 text-center">
              <button 
                onClick={onBack} 
                className="text-[10px] font-black text-slate-400 hover:text-amber-500 uppercase tracking-widest transition-all hover:tracking-[0.2em]"
              >
                ← Back to Landing Page
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-white/20 mt-10 text-[10px] font-black uppercase tracking-[0.5em]">Beta Academy v4.2 Elite</p>
      </div>
    </div>
  );
};
