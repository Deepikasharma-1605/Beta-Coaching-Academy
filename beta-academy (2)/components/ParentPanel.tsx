
import React, { useEffect, useState } from 'react';
import { User, MONTHS } from '../types';
import { StatCard, SelectField } from './DashboardUI';

interface ParentPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  notices: any[];
  timetable: any[];
  homework: any[];
  marks: any[];
  syllabus: any[];
  students: any[];
}

export const ParentPanel: React.FC<ParentPanelProps> = ({
  activeTab,
  setActiveTab,
  user,
  notices = [],
  timetable = [],
  homework = [],
  marks = [],
  syllabus = [],
  students = []
}) => {
  const currentMonth = MONTHS[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // CRITICAL: Reset everything when switching tabs so features open from the "beginning"
  useEffect(() => {
    setSelectedMonth(currentMonth);
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const childData = students.find(s => s.parentEmail === user.email);
  const batch = childData?.batch || 'N/A';
  const childEmail = childData?.email || '';
  const childName = childData?.name || 'Your Child';

  const childTimetable = timetable.filter(t => t.batch === batch && (t.month === selectedMonth || !t.month));
  const childHomework = homework.filter(h => h.batch === batch);
  const childMarks = marks.filter(m => m.studentEmail === childEmail);
  const childSyllabus = syllabus.filter(s => s.batch === batch);
  
  const myNotices = notices.filter(n => n.target === 'All' || n.target === 'Parents' || (n.target === 'Batch' && n.targetValue === batch));

  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-[#384959]">👨‍👩‍👧 Parent Portal</h2>
              <p className="text-[#6A89A7] font-medium">Child: <span className="text-[#384959] font-bold">{childName}</span> ({batch})</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Child's Classes" value={childTimetable.length} color="#88BDF2" textColor="#384959" />
            <StatCard title="Pending Tasks" value={childHomework.length} color="#384959" textColor="white" />
            <StatCard title="Overall Score" value={childMarks.length > 0 ? `${Math.round(childMarks.reduce((acc, curr) => acc + (Number(curr.score)/Number(curr.total)*100), 0) / childMarks.length)}%` : 'N/A'} color="#BDDDFC" textColor="#384959" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#384959] mb-6 flex items-center">
                <span className="mr-2">📢</span> Recent News
              </h3>
              <div className="space-y-4">
                {myNotices.slice(0, 4).map(n => (
                  <div key={n.id} className="p-4 bg-gray-50 rounded-2xl border-l-4 border-[#88BDF2]">
                    <p className="text-sm font-medium text-[#384959]">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase font-black">{n.senderRole} Announcement</p>
                  </div>
                ))}
                {myNotices.length === 0 && <p className="text-slate-400 italic text-sm">No recent announcements.</p>}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#384959] mb-6 flex items-center">
                <span className="mr-2">📉</span> Progress Note
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">Track your child's attendance and fixed class schedule (Mon-Sat) regularly to ensure academic success.</p>
              <button onClick={() => setActiveTab('marks_view')} className="w-full py-4 bg-[#384959] text-white font-black rounded-2xl text-xs uppercase tracking-widest">Full Performance Report</button>
            </div>
          </div>
        </div>
      );

    case 'timetable_view':
      return (
        <div className="space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#384959]">📅 {childName}'s Routine</h3>
            <div className="w-48"><SelectField value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} /></div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest border-b">
                <tr><th className="px-8 py-5">Subject</th><th className="px-8 py-5">Time Slot</th><th className="px-8 py-5">Type</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {childTimetable.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 text-xs font-black uppercase text-[#88BDF2]">{t.subject}</td>
                    <td className="px-8 py-5 font-mono text-sm font-bold text-[#384959]">{t.displayStartTime || t.startTime} - {t.displayEndTime || t.endTime}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">{t.classType || 'Regular'}</span>
                    </td>
                  </tr>
                ))}
                {childTimetable.length === 0 && (
                   <tr><td colSpan={3} className="px-8 py-20 text-center text-gray-400 italic">No classes found in this routine for {selectedMonth}.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'homework_view':
      return (
        <div className="space-y-8 animate-in fade-in">
          <h3 className="text-2xl font-bold text-[#384959]">📝 Homework Tracker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {childHomework.map(h => (
              <div key={h.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <span className="px-3 py-1 bg-blue-50 text-[#88BDF2] text-[10px] font-black rounded-full uppercase">{h.subject}</span>
                <h4 className="text-lg font-black text-[#384959] mt-2 mb-2">{h.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{h.description}</p>
                <p className="text-[10px] font-bold text-red-400 mt-4">Due: {h.deadline}</p>
              </div>
            ))}
            {childHomework.length === 0 && <p className="col-span-2 text-center py-20 text-gray-400 italic">No homework assignments listed.</p>}
          </div>
        </div>
      );

    case 'marks_view':
      return (
        <div className="space-y-8 animate-in fade-in">
          <h3 className="text-2xl font-bold text-[#384959]">📊 Academic Report</h3>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest border-b">
                <tr><th className="px-8 py-5">Assessment</th><th className="px-8 py-5 text-right">Performance</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {childMarks.map(m => (
                  <tr key={m.id}>
                    <td className="px-8 py-5 font-bold">{m.testType} - {m.subject}</td>
                    <td className="px-8 py-5 text-right font-black text-blue-600">{Math.round((Number(m.score)/Number(m.total))*100)}%</td>
                  </tr>
                ))}
                {childMarks.length === 0 && (
                   <tr><td colSpan={2} className="px-8 py-20 text-center text-gray-400 italic">No test records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'syllabus_view':
      return (
        <div className="space-y-8 animate-in fade-in">
          <h3 className="text-2xl font-bold text-[#384959]">📚 Course Tracker</h3>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest border-b">
                <tr><th className="px-8 py-5">Topic</th><th className="px-8 py-5 text-right">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {childSyllabus.map(s => (
                  <tr key={s.id}>
                    <td className="px-8 py-5 font-bold">{s.topic}</td>
                    <td className="px-8 py-5 text-right font-black uppercase text-xs">{s.status}</td>
                  </tr>
                ))}
                {childSyllabus.length === 0 && (
                   <tr><td colSpan={2} className="px-8 py-20 text-center text-gray-400 italic">No syllabus tracking available for this batch.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

    default: return null;
  }
};
