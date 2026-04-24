
import React, { useState, useEffect } from 'react';

interface HeroProps {
  onGetStarted: () => void;
}

const SUCCESS_STORIES = [
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop",
    title: "Success Stories",
    subtitle: "Consistently delivering top ranks since 2010"
  },
  {
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1470&auto=format&fit=crop",
    title: "National Pride",
    subtitle: "Highest selection rate in JEE Advanced & NEET"
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop",
    title: "Modern Learning",
    subtitle: "Hybrid classrooms designed for excellence"
  }
];

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SUCCESS_STORIES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Premium Hero Carousel */}
      <div className="relative h-[100vh] w-full bg-[#0a192f]">
        {SUCCESS_STORIES.map((item, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/40 to-[#0a192f]/20 z-10"></div>
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover opacity-60 transition-transform duration-[10s] scale-110"
              style={{ transform: idx === activeSlide ? 'scale(1)' : 'scale(1.1)' }}
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-6">
              <div className="max-w-4xl">
                <div className="mb-4 md:mb-6 inline-block bg-amber-400/20 border border-amber-400/30 px-4 py-1.5 rounded-full backdrop-blur-md reveal">
                  <span className="text-amber-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Excellence Redefined</span>
                </div>
                <h1 className="text-4xl md:text-8xl font-black text-white mb-6 md:mb-8 leading-none tracking-tighter reveal">
                  {item.title}
                </h1>
                <p className="text-lg md:text-2xl text-slate-300 font-medium mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed reveal" style={{ transitionDelay: '200ms' }}>
                  {item.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 reveal" style={{ transitionDelay: '400ms' }}>
                  <button 
                    onClick={onGetStarted}
                    className="w-full sm:w-auto group bg-amber-400 text-[#0a192f] px-10 md:px-12 py-4 md:py-5 rounded-lg font-black hover:bg-white transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(251,191,36,0.3)] uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center"
                  >
                    Join the Academy
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button className="w-full sm:w-auto group flex items-center justify-center text-white font-black hover:text-amber-400 transition-colors uppercase tracking-widest text-[10px] md:text-xs py-4 md:py-5 px-10 md:px-12 border border-white/20 rounded-lg backdrop-blur-md hover:bg-white/5">
                    <span className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 group-hover:bg-amber-400/20 transition-colors">▶</span>
                    Watch Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Indicators */}
        <div className="absolute bottom-10 md:bottom-12 left-0 right-0 z-30 flex justify-center space-x-3">
          {SUCCESS_STORIES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1 rounded-full transition-all duration-500 ${
                idx === activeSlide ? 'bg-amber-400 w-12 md:w-16' : 'bg-white/20 w-3 md:w-4'
              }`}
            />
          ))}
        </div>
      </div>

      {/* About Section - Split Layout */}
      <div className="bg-[#f8fafc] py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="reveal-scale order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-2 md:-inset-4 bg-amber-400 rounded-2xl md:rounded-3xl -rotate-2 md:-rotate-3 -z-10 group-hover:rotate-0 transition-transform duration-700"></div>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop"
                  alt="Students learning"
                  className="rounded-xl md:rounded-2xl shadow-2xl w-full aspect-[4/3] object-cover"
                />
                <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 bg-[#0a192f] p-6 md:p-10 rounded-xl md:rounded-2xl shadow-2xl border border-white/10 animate-float hidden md:block">
                  <h4 className="text-amber-400 text-4xl md:text-5xl font-black mb-1">14+</h4>
                  <p className="text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">Years of Legacy</p>
                </div>
              </div>
            </div>
            <div className="space-y-8 md:space-y-10 order-1 lg:order-2 reveal text-center lg:text-left">
              <div className="space-y-4">
                <h2 className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">About Us</h2>
                <h3 className="text-3xl md:text-6xl font-black text-[#0a192f] leading-tight">
                  Crafting Ranks & <br /><span className="text-amber-600">Defining Futures</span>
                </h3>
              </div>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Beta Academy is more than just a coaching class; it's a sanctuary for academic growth. Founded on the principles of <strong>conceptual clarity</strong> and <strong>personalized attention</strong>, we have successfully guided thousands of students to the gates of IITs, AIIMS, and NITs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-4">
                <div className="flex items-start justify-center lg:justify-start space-x-4 group">
                  <div className="w-10 md:w-12 h-10 md:h-12 shrink-0 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-400 group-hover:text-white transition-all">✨</div>
                  <div className="text-left">
                    <h5 className="font-bold text-[#0a192f] text-sm md:text-base">Elite Faculty</h5>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Learn from IITians & Ph.Ds</p>
                  </div>
                </div>
                <div className="flex items-start justify-center lg:justify-start space-x-4 group">
                  <div className="w-10 md:w-12 h-10 md:h-12 shrink-0 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-400 group-hover:text-white transition-all">📊</div>
                  <div className="text-left">
                    <h5 className="font-bold text-[#0a192f] text-sm md:text-base">Smart Testing</h5>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Real-time analysis & growth</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 md:pt-6">
                <button className="text-[#0a192f] font-black underline decoration-amber-400 decoration-2 md:decoration-4 underline-offset-8 hover:text-amber-600 transition-colors uppercase tracking-widest text-[10px] md:text-xs">
                  Discover Our Mission
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
