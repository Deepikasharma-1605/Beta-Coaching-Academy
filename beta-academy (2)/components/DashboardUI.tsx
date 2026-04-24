
import React from 'react';

export const NavTab = ({ id, label, icon, active, onClick }: any) => (
  <button 
    onClick={() => onClick(id)} 
    className={`w-full text-left px-5 py-4 rounded-2xl flex items-center transition-all duration-300 ${active === id ? 'bg-amber-400 text-[#0a192f] font-black shadow-[0_10px_20px_rgba(251,191,36,0.2)] scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    <span className="mr-4 text-xl">{icon}</span><span className="text-xs font-bold uppercase tracking-wide">{label}</span>
  </button>
);

export const NavParent = ({ id, label, icon, expanded, onToggle, children }: any) => (
  <div className="mb-1">
    <button onClick={onToggle} className="w-full text-left px-5 py-4 flex items-center justify-between text-slate-400 hover:text-white group transition-colors">
      <div className="flex items-center"><span className="mr-4 text-xl opacity-80">{icon}</span><span className="text-xs font-bold uppercase tracking-wide">{label}</span></div>
      <span className={`text-[10px] transition-transform duration-300 ${expanded ? 'rotate-180 text-amber-400' : ''}`}>▼</span>
    </button>
    {expanded && <div className="ml-8 space-y-1 mt-1 mb-4 border-l border-white/10 pl-2">{children}</div>}
  </div>
);

export const NavSub = ({ id, label, active, onClick }: any) => (
  <button 
    onClick={() => onClick(id)} 
    className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-bold transition-all duration-300 ${active === id ? 'text-amber-400 bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
  >
    {label}
  </button>
);

export const StatCard = ({ title, value, color, textColor = '#1e293b' }: any) => (
  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: color }}></div>
    <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-3">{title}</h4>
    <p style={{ color: textColor }} className="text-2xl md:text-4xl font-black truncate tracking-tighter">{value}</p>
    <div className="absolute bottom-[-20px] right-[-10px] opacity-[0.03] text-8xl transition-all group-hover:scale-110 group-hover:rotate-6">📊</div>
  </div>
);

export const InputField = ({ label, type = 'text', value, onChange, required = false, disabled = false }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      disabled={disabled} 
      required={required} 
      type={type} 
      value={value} 
      onChange={e => onChange ? onChange(e.target.value) : null} 
      className={`w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 outline-none transition-all text-sm font-semibold text-slate-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
    />
  </div>
);

export const SelectField = ({ label, value, options, onChange }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 outline-none transition-all text-sm font-semibold appearance-none text-slate-800 cursor-pointer"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
    </div>
  </div>
);
