
import React from 'react';

const HIGHLIGHTS = [
  { icon: "🎓", text: "Expert Faculty", desc: "Learn from top-tier subject experts." },
  { icon: "🎯", text: "Personal Mentoring", desc: "Individual attention for every learner." },
  { icon: "📝", text: "Daily Practice", desc: "Rigorous daily problem-solving sessions." },
  { icon: "🧪", text: "Best-in-class Labs", desc: "Experimental learning for Foundation." },
  { icon: "📱", text: "Digital Portal", desc: "24/7 access to study material & tests." },
  { icon: "🏆", text: "Rank Strategy", desc: "Proven methods to climb the AIR list." }
];

const TOPPERS = [
  { name: "Aryan Singh", rank: "AIR 245", score: "JEE Advanced", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60" },
  { name: "Neha Verma", rank: "680+", score: "NEET Score", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60" },
  { name: "Rahul Jha", rank: "99.9%", score: "Foundation", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" }
];

export const Features: React.FC = () => {
  return (
    <section className="bg-white overflow-hidden">
      {/* 3. Programs We Offer */}
      <div className="bg-slate-50 py-20 md:py-32 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24 reveal">
            <h2 className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4">Educational Programs</h2>
            <h3 className="text-3xl md:text-6xl font-black text-[#0a192f]">Elite Courses We Offer</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {['JEE', 'NEET', 'Foundation'].map((course, idx) => (
              <div key={idx} className="reveal-scale group relative bg-white p-8 md:p-12 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-amber-400 transition-all duration-500 hover:-translate-y-2 md:hover:-translate-y-4" style={{ transitionDelay: `${idx * 150}ms` }}>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-400 text-[#0a192f] rounded-2xl mb-8 md:mb-10 flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg shadow-amber-400/20">
                  {idx === 0 ? '📐' : idx === 1 ? '🧬' : '🎒'}
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-[#0a192f] mb-4 md:mb-6 tracking-tighter">{course}</h4>
                <p className="text-slate-500 mb-8 md:mb-10 leading-relaxed text-sm md:text-base">
                  Deep conceptual learning and rigorous practice modules designed to ensure maximum selection rates in {course}.
                </p>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center group-hover:text-amber-400 transition-colors">
                  View Curriculum <span className="ml-2">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Why Choose Us (Our Unique Edge) */}
      <div className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <h2 className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4">Our Core Philosophy</h2>
          <h3 className="text-3xl md:text-5xl font-black text-[#0a192f]">Our Unique Edge</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-20 md:mb-24">
          {HIGHLIGHTS.map((item, idx) => (
            <div key={idx} className="reveal group p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-[#0a192f] transition-all duration-500" style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="text-3xl md:text-4xl mb-4 md:mb-6">{item.icon}</div>
              <h5 className="text-base md:text-lg font-black text-[#0a192f] group-hover:text-amber-400 transition-colors mb-2">{item.text}</h5>
              <p className="text-xs md:text-sm text-slate-500 group-hover:text-white/60 transition-colors leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto reveal-scale">
           <div className="bg-amber-400 p-8 md:p-12 rounded-[2rem] md:rounded-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
             <p className="text-xl md:text-4xl font-black text-[#0a192f] leading-tight italic text-center relative z-10">
               "We don't just teach subjects; we inspire a lifelong passion for learning and problem-solving."
             </p>
           </div>
        </div>
      </div>

      {/* 6. Results & Achievements */}
      <div className="bg-white py-20 md:py-40 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,_#0a192f_0%,_transparent_25%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_80%_80%,_#fbbf24_0%,_transparent_25%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 md:mb-32 reveal">
            <h2 className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-6">Proven Success</h2>
            <h3 className="text-4xl md:text-7xl font-black text-[#0a192f] mb-8 tracking-tighter">Results & Achievements</h3>
            <div className="h-1 w-24 md:h-1.5 md:w-32 bg-amber-400 mx-auto rounded-full pulse-gold opacity-60"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-12 mb-20 md:mb-40">
            <div className="reveal text-center group" style={{ transitionDelay: '100ms' }}>
              <p className="text-5xl md:text-7xl font-black text-amber-500 mb-2 group-hover:scale-110 transition-transform">95%</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Selection Rate</p>
            </div>
            <div className="reveal text-center group" style={{ transitionDelay: '300ms' }}>
              <p className="text-5xl md:text-7xl font-black text-[#0a192f] mb-2 group-hover:scale-110 transition-transform">AIR <span className="text-amber-500">245</span></p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">JEE Advanced</p>
            </div>
            <div className="reveal text-center group" style={{ transitionDelay: '500ms' }}>
              <p className="text-5xl md:text-7xl font-black text-[#0a192f] mb-2 group-hover:scale-110 transition-transform">680+</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">NEET Score</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-20 md:mb-40">
            {TOPPERS.map((topper, idx) => (
              <div key={idx} className="reveal-scale group" style={{ transitionDelay: `${idx * 200}ms` }}>
                <div className="perspective-1000">
                   <div className="relative preserve-3d transition-all duration-700 md:group-hover:rotate-y-6">
                     <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-xl hover:shadow-2xl transition-shadow duration-500">
                        <div className="relative overflow-hidden rounded-2xl mb-6 md:mb-8">
                          <img src={topper.img} alt={topper.name} className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute top-4 right-4 bg-amber-400 text-[#0a192f] px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-xl">Topper</div>
                        </div>
                        <h4 className="text-xl md:text-2xl font-black text-[#0a192f] mb-1">{topper.name}</h4>
                        <p className="text-amber-600 font-black uppercase text-[10px] tracking-widest">{topper.rank} • {topper.score}</p>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Year-wise Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center border-t border-slate-100 pt-20 md:pt-40">
            <div className="space-y-10 md:space-y-12 reveal text-center lg:text-left">
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-[#0a192f] mb-4">Year-wise Growth</h3>
                <p className="text-slate-500 text-sm md:text-base">Our consistent upward trajectory in student success metrics.</p>
              </div>
              <div className="space-y-8 md:space-y-10 max-w-xl mx-auto lg:mx-0">
                {[
                  { year: '2023', val: '95%', label: 'Max Selections' },
                  { year: '2022', val: '88%', label: 'Top 500 Ranks' },
                  { year: '2021', val: '82%', label: 'National Average' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-lg md:text-xl font-black text-[#0a192f]">{item.year}</span>
                      <span className="text-amber-600 font-black text-[10px] md:text-sm uppercase tracking-widest">{item.label}</span>
                    </div>
                    <div className="h-2 md:h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-[2s] delay-500 ease-out active" style={{ width: item.val }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="reveal-scale bg-slate-50 p-8 md:p-16 rounded-[2.5rem] md:rounded-3xl text-center group relative border border-slate-100">
              <div className="absolute -inset-1 bg-amber-400 rounded-3xl blur opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-8 md:p-12 rounded-2xl shadow-sm">
                <h4 className="text-[#0a192f] text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4">Total Impact</h4>
                <p className="text-5xl md:text-8xl font-black text-[#0a192f] tracking-tighter mb-4">12,450+</p>
                <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Students Qualified National Exams</p>
                <div className="mt-8 md:mt-12 flex justify-center space-x-2">
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-amber-400 animate-pulse"></div>
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-amber-400 animate-pulse delay-75"></div>
                  <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-amber-400 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
