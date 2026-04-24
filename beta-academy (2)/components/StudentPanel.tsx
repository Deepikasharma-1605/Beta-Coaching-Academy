
import React, { useState, useEffect, useMemo } from 'react';
import { User, MONTHS } from '../types';
import { StatCard, SelectField, InputField } from './DashboardUI';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface StudentPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  notices: any[];
  timetable: any[];
  homework: any[];
  homeworkCompletions?: any[];
  marks: any[];
  syllabus: any[];
  students: any[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  testFilter: string;
  setTestFilter: (filter: string) => void;
  testSeriesSubFilter: string;
  setTestSeriesSubFilter: (sub: string) => void;
}

export const StudentPanel: React.FC<StudentPanelProps> = ({
  activeTab,
  setActiveTab,
  user,
  notices = [],
  timetable = [],
  homework = [],
  homeworkCompletions = [],
  marks = [],
  syllabus = [],
  students = [],
  selectedMonth,
  setSelectedMonth,
  testFilter,
  setTestFilter,
  testSeriesSubFilter,
  setTestSeriesSubFilter
}) => {
  const [inboxFilter, setInboxFilter] = useState<'Faculty' | 'Admin'>('Admin');
  const [isNoticeLoading, setIsNoticeLoading] = useState(false);
  const [isTrackerActive, setIsTrackerActive] = useState(false);
  
  // Settings state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [selectedHwId, setSelectedHwId] = useState<string | null>(null);

  // Reset local transitions when switching tabs
  useEffect(() => {
    setNewPassword('');
    setConfirmPassword('');
    setSelectedHwId(null);
    setIsTrackerActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'messages_view') {
        setIsNoticeLoading(true);
        const timer = setTimeout(() => setIsNoticeLoading(false), 400);
        return () => clearTimeout(timer);
    }
  }, [inboxFilter, activeTab]);

  const studentData = useMemo(() => students.find(s => s.email === user.email), [students, user.email]);
  const batch = studentData?.batch || 'N/A';
  const category = studentData?.course || 'N/A';

  const threeDaysAgoSeconds = useMemo(() => Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60), []);

  const myTimetable = useMemo(() => timetable
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')), [timetable]);

  const myHomework = useMemo(() => homework.filter(h => h.batch === batch), [homework, batch]);
  const pendingHomework = useMemo(() => myHomework.filter(h => {
    const completion = homeworkCompletions?.find(c => c.homeworkId === h.id && c.studentEmail === user.email);
    return !completion?.completed;
  }), [myHomework, homeworkCompletions, user.email]);

  // NOTE: 'marks' is now already filtered by the parent (Dashboard.tsx) using Firestore queries.
  // This satisfies the requirement to read only the selected option from the database.
  const filteredMarksByExam = marks;

  const filteredNotices = useMemo(() => notices
    .filter(n => {
        const matchesTarget = (n.target === 'Students' && n.targetValue === 'All') ||
                            (n.target === 'StudentCategory' && n.targetValue === category) ||
                            (n.target === 'Batch' && n.targetValue === batch);
        
        const isRecent = n.createdAt?.seconds ? n.createdAt.seconds >= threeDaysAgoSeconds : true;
        const matchesSource = n.senderRole === inboxFilter;
        return matchesTarget && isRecent && matchesSource;
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [notices, category, batch, threeDaysAgoSeconds, inboxFilter]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData?.id) return;
    if (newPassword !== confirmPassword) { alert("Passwords do not match!"); return; }
    setPasswordLoading(true);
    try {
      await updateDoc(doc(db, 'students', studentData.id), { password: newPassword });
      alert("Password updated!");
      setNewPassword(''); setConfirmPassword('');
    } catch (err) { alert("Failed to update password."); }
    finally { setPasswordLoading(false); }
  };

  const headingColor = "text-[#050c1a]";

  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <h2 className={`text-2xl md:text-3xl font-extrabold ${headingColor}`}>👋 Welcome, {user.name.split(' ')[0]}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard title="Today's Classes" value={myTimetable.length} color="#050c1a" textColor="#ffc107" />
            <StatCard title="Due Assignments" value={pendingHomework.length} color="#ffc107" textColor="#050c1a" />
            <StatCard title="Test Results" value={filteredMarksByExam.length > 0 ? `${filteredMarksByExam[0].score}/${filteredMarksByExam[0].total}` : 'N/A'} color="#f1f5f9" textColor="#050c1a" />
          </div>
          <div className="bg-[#050c1a] p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h3 className="font-bold text-white mb-8 flex items-center text-sm md:text-base">
              <span className="text-amber-400 mr-3 p-2 bg-white/5 rounded-lg">📢</span> 
              Live Broadcast Channel (72h)
            </h3>
            <div className="space-y-4">
                {notices.filter(n => (n.target === 'Students' && n.targetValue === 'All') || (n.target === 'Batch' && n.targetValue === batch)).slice(0, 3).map(n => (
                <div key={n.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] md:text-[9px] font-black text-amber-400 uppercase tracking-widest">{n.senderRole} NOTICE</span>
                        <span className="text-[8px] text-white/30 uppercase font-bold">{n.createdAt?.toDate?.()?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-200 leading-relaxed">{n.text}</p>
                </div>
                ))}
                {notices.length === 0 && <p className="text-slate-500 text-sm italic py-4 text-center">No broadcast messages yet.</p>}
            </div>
          </div>
        </div>
      );

    case 'messages_view':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className={`text-xl md:text-2xl font-bold ${headingColor}`}>✉️ Communication Hub</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Filtering channel: {inboxFilter}</p>
            </div>
            <div className="bg-amber-400/10 text-amber-600 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-400/20">
              Syncing past 72 hours
            </div>
          </div>
          
          <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-fit">
            <button 
                onClick={() => setInboxFilter('Admin')} 
                className={`px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inboxFilter === 'Admin' ? 'bg-[#050c1a] text-amber-400 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Admin Directives
            </button>
            <button 
                onClick={() => setInboxFilter('Faculty')} 
                className={`px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inboxFilter === 'Faculty' ? 'bg-[#050c1a] text-amber-400 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Faculty Updates
            </button>
          </div>

          <div className="space-y-5">
            {isNoticeLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing {inboxFilter} Records...</p>
                </div>
            ) : (
                <>
                {filteredNotices.map(n => (
                    <div key={n.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all hover:shadow-xl hover:border-amber-400/50">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg mr-4 border border-slate-100">
                                    {inboxFilter === 'Admin' ? '🛡️' : '👨‍🏫'}
                                </div>
                                <div>
                                    <h4 className="font-black text-[#050c1a] text-sm md:text-base">{n.senderName}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.senderRole}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">{n.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                        </div>
                        <div className="text-slate-700 text-sm md:text-base bg-slate-50/50 p-5 md:p-8 rounded-3xl leading-relaxed border border-slate-50">
                            {n.text}
                        </div>
                    </div>
                ))}
                {filteredNotices.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 border-dashed">
                        <div className="text-5xl mb-6 opacity-40">📭</div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent messages found from {inboxFilter}</p>
                    </div>
                )}
                </>
            )}
          </div>
        </div>
      );

    case 'timetable_view':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className={`text-xl md:text-2xl font-bold ${headingColor}`}>📅 Weekly Routine</h3>
            <div className="w-full md:w-56"><SelectField value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} /></div>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <tr><th className="px-10 py-6">Subject Area</th><th className="px-10 py-6 text-right">Scheduled Interval</th><th className="px-10 py-6 text-right">Class Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myTimetable.map(t => (
                    <tr key={t.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-10 py-6 text-[11px] md:text-xs font-black text-amber-600 uppercase tracking-tight">{t.subject}</td>
                      <td className="px-10 py-6 text-right font-mono text-xs md:text-sm font-bold text-[#050c1a]">{t.displayStartTime} - {t.displayEndTime}</td>
                      <td className="px-10 py-6 text-right"><span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest">Active</span></td>
                    </tr>
                  ))}
                  {myTimetable.length === 0 && (
                    <tr><td colSpan={3} className="px-10 py-24 text-center text-slate-400 italic font-medium">No routine published for {selectedMonth}.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'homework_view':
      const currentHw = myHomework.find(h => h.id === selectedHwId);
      
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className={`text-xl md:text-2xl font-bold ${headingColor}`}>📝 Academic Tasks</h3>
            {(isTrackerActive || selectedHwId) && (
              <button 
                onClick={() => {
                  if (selectedHwId) {
                    setSelectedHwId(null);
                  } else {
                    setIsTrackerActive(false);
                  }
                }} 
                className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline flex items-center"
              >
                <span className="mr-2">←</span> {selectedHwId ? 'Back to List' : 'Back to Portal'}
              </button>
            )}
          </div>

          {!isTrackerActive ? (
            <div className="max-w-3xl mx-auto py-12 md:py-20 animate-in zoom-in-95 duration-500">
               <div className="bg-[#050c1a] p-10 md:p-16 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-all group-hover:opacity-10"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-amber-400 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-8 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      📝
                    </div>
                    <h4 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">Assignment Tracker</h4>
                    <p className="text-slate-400 text-sm md:text-lg mb-12 max-w-md mx-auto font-medium leading-relaxed">
                      Access your complete record of current and past academic assignments for the {batch} batch.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      <button 
                        onClick={() => setIsTrackerActive(true)}
                        className="bg-amber-400 text-[#050c1a] px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(251,191,36,0.2)] hover:bg-white transition-all active:scale-95"
                      >
                        Launch Tracker
                      </button>
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Current Status</span>
                        <span className="text-white font-bold text-sm">{pendingHomework.length} Pending Tasks</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          ) : !selectedHwId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6 duration-700">
              {myHomework.map(h => {
                const completion = homeworkCompletions?.find(c => c.homeworkId === h.id && c.studentEmail === user.email);
                const status = completion?.completed || false;
                return (
                  <div key={h.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:border-amber-400 transition-all hover:shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[9px] font-black text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{h.subject}</span>
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full ${status ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                        {status ? 'SUBMITTED' : 'ACTION REQUIRED'}
                      </span>
                    </div>
                    <h4 className="text-lg md:text-xl font-black text-[#050c1a] mb-3 leading-tight tracking-tight">{h.title}</h4>
                    <p className="text-xs md:text-sm text-slate-500 line-clamp-2 mb-8 leading-relaxed font-medium">{h.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                      <div className="flex flex-col">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                        <p className="text-[11px] font-black text-red-500">{h.deadline}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedHwId(h.id)}
                        className="bg-[#050c1a] text-amber-400 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
              {myHomework.length === 0 && (
                <div className="col-span-2 text-center py-20 text-slate-400 italic">No assignments currently active in the record.</div>
              )}
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-4">
              <div className="bg-[#050c1a] p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400 opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="bg-amber-400 text-[#050c1a] px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{currentHw?.subject}</span>
                    <div className="h-px w-12 bg-white/20"></div>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Detailed View</span>
                  </div>
                  <h4 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tighter">{currentHw?.title}</h4>
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-10">
                    <p className="text-slate-300 text-sm md:text-xl leading-relaxed font-medium">{currentHw?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Issuing Faculty</p>
                      <p className="font-bold text-amber-400 text-sm md:text-base">{currentHw?.facultyName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Submission Date</p>
                      <p className="font-bold text-red-400 text-sm md:text-base">{currentHw?.deadline}</p>
                    </div>
                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Completion Log</p>
                      <p className="font-bold text-sm md:text-base text-green-400">
                        {homeworkCompletions?.find(c => c.homeworkId === selectedHwId && c.studentEmail === user.email)?.completed ? 'Verified Selection' : 'Awaiting Faculty Check'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'marks_view':
      const examFilters = ['Weekly', 'Monthly', 'Half-Yearly', 'Final Exam', 'Test Series'];
      const testSeriesOptions = ['1', '2', '3'];
      
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div>
            <h3 className={`text-xl md:text-2xl font-bold ${headingColor}`}>📊 Performance Analytics</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select category to live-query results</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 md:gap-3 p-2 bg-slate-100 rounded-[2rem] w-fit">
              {examFilters.map(f => (
                <button 
                  key={f} 
                  onClick={() => setTestFilter(f)}
                  className={`px-5 md:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${testFilter === f ? 'bg-[#050c1a] text-amber-400 shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {testFilter === 'Test Series' && (
              <div className="flex flex-wrap gap-2 md:gap-3 p-1.5 bg-amber-400/10 rounded-2xl w-fit animate-in slide-in-from-left-2">
                {testSeriesOptions.map(num => (
                  <button 
                    key={num} 
                    onClick={() => setTestSeriesSubFilter(num)}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${testSeriesSubFilter === num ? 'bg-amber-400 text-[#050c1a] shadow-md' : 'text-amber-600/60 hover:text-amber-600 hover:bg-amber-400/10'}`}
                  >
                    Series {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <tr>
                    <th className="px-10 py-7">Test Name & Subject</th>
                    <th className="px-10 py-7">Faculty Signature</th>
                    <th className="px-10 py-7 text-right">Achieved Score</th>
                    <th className="px-10 py-7 text-right">Performance Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMarksByExam.map(m => {
                    const percentage = Math.round((Number(m.score) / Number(m.total)) * 100);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-10 py-7">
                          <p className="font-black text-[#050c1a] text-sm md:text-base group-hover:text-amber-600 transition-colors">{m.testType}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5 tracking-tight">{m.subject}</p>
                        </td>
                        <td className="px-10 py-7">
                          <p className="text-xs font-bold text-slate-500">{m.facultyEmail || 'Admin Entry'}</p>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <span className="font-black text-slate-800 text-lg md:text-xl tracking-tighter">{m.score}</span>
                          <span className="text-slate-300 mx-2">/</span>
                          <span className="font-bold text-slate-400 text-sm">{m.total}</span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <div className="hidden sm:block w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${percentage >= 75 ? 'bg-green-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className={`text-[11px] font-black px-3 py-1 rounded-lg ${percentage >= 75 ? 'bg-green-50 text-green-600' : percentage >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMarksByExam.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-10 py-32 text-center">
                        <div className="text-4xl mb-4 opacity-20">📈</div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No validated results for {testFilter === 'Test Series' ? `Test Series ${testSeriesSubFilter}` : testFilter} category</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'settings_student':
      return (
        <div className="max-w-xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-amber-400/10 rounded-[2rem] mx-auto flex items-center justify-center text-3xl mb-4 border border-amber-400/20">🛡️</div>
                <h4 className="font-black text-[#050c1a] text-lg uppercase tracking-tight">Account Security</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Manage your portal access</p>
             </div>
             <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <InputField label="New Portal Password" type="password" value={newPassword} onChange={setNewPassword} required />
                <InputField label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
                <button type="submit" disabled={passwordLoading} className="w-full bg-[#050c1a] text-amber-400 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 disabled:opacity-50">
                    {passwordLoading ? 'Verifying & Saving...' : 'Synchronize New Password'}
                </button>
             </form>
          </div>
        </div>
      );

    default: return null;
  }
};
