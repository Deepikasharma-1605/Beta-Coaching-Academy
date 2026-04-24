
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp, deleteDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { User, BATCH_CONFIG, TEST_TYPES, MONTHS, SUBJECT_CONFIG } from '../types';
import { StatCard, InputField, SelectField } from './DashboardUI';

interface FacultyPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  students: any[];
  faculty: any[];
  timetable: any[];
  homework: any[];
  homeworkCompletions?: any[];
  marks: any[];
  syllabus: any[];
  tests: any[];
  notices?: any[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export const FacultyPanel: React.FC<FacultyPanelProps> = ({
  activeTab,
  setActiveTab,
  user,
  students = [],
  faculty = [],
  timetable = [],
  homework = [],
  homeworkCompletions = [],
  marks = [],
  syllabus = [],
  tests = [],
  notices = [],
  selectedMonth,
  setSelectedMonth
}) => {
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Form states
  const [marksBatch, setMarksBatch] = useState(BATCH_CONFIG['JEE'][0]);
  const [marksTestType, setMarksTestType] = useState(TEST_TYPES[0]);
  const [marksSubject, setMarksSubject] = useState(SUBJECT_CONFIG['JEE'][0]);
  const [totalMarks, setTotalMarks] = useState('100');
  const [studentScores, setStudentScores] = useState<Record<string, string>>({});
  const [hwForm, setHwForm] = useState({ title: '', description: '', batch: BATCH_CONFIG['JEE'][0], subject: SUBJECT_CONFIG['JEE'][0], deadline: '' });
  const [noticeForm, setNoticeForm] = useState({ text: '', target: 'Batch', targetValue: BATCH_CONFIG['JEE'][0] });

  // Tracking state for History Detail
  const [selectedHwId, setSelectedHwId] = useState<string | null>(null);

  // CRITICAL: Reset everything when switching tabs
  useEffect(() => {
    setNewPassword('');
    setConfirmPassword('');
    setMarksBatch(BATCH_CONFIG['JEE'][0]);
    setMarksTestType(TEST_TYPES[0]);
    setMarksSubject(SUBJECT_CONFIG['JEE'][0]);
    setTotalMarks('100');
    setStudentScores({});
    setHwForm({ title: '', description: '', batch: BATCH_CONFIG['JEE'][0], subject: SUBJECT_CONFIG['JEE'][0], deadline: '' });
    setNoticeForm({ text: '', target: 'Batch', targetValue: BATCH_CONFIG['JEE'][0] });
    setSelectedHwId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const currentFacultyRecord = faculty.find(f => f.email.toLowerCase() === user.email.toLowerCase());
  const facultyExpertise = currentFacultyRecord?.course || 'JEE';

  // Timetable is already filtered by month at the Dashboard Firestore query level
  const myClasses = timetable
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const myHomework = homework.filter(h => h.facultyEmail === user.email);
  const pendingHomeworkCount = myHomework.length;

  const relevantNotices = notices
    .filter(n => {
      if (n.target === 'Faculty' && n.targetValue === 'All') return true;
      if (n.target === 'FacultyCategory' && n.targetValue === facultyExpertise) return true;
      return false;
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const batchStudentsCount = students.filter(s => s.course === facultyExpertise).length;

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'homework'), {
        ...hwForm,
        facultyEmail: user.email,
        facultyName: user.name,
        createdAt: Timestamp.now()
      });
      alert("Homework posted successfully!");
      setHwForm({ ...hwForm, title: '', description: '', deadline: '' });
      setActiveTab('homework_all');
    } catch (err) { alert("Error posting homework"); }
    finally { setLoading(false); }
  };

  const handleAddMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const promises = Object.entries(studentScores).map(([email, score]) => {
        if (!score) return Promise.resolve();
        return addDoc(collection(db, 'marks'), {
          studentEmail: email,
          testType: marksTestType,
          subject: marksSubject,
          score: score,
          total: totalMarks,
          facultyEmail: user.email,
          createdAt: Timestamp.now()
        });
      });
      await Promise.all(promises);
      alert("Marks uploaded successfully!");
      setStudentScores({});
      setActiveTab('overview');
    } catch (err) { alert("Error uploading marks"); }
    finally { setLoading(false); }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'notices'), {
        text: noticeForm.text,
        target: 'Batch',
        targetValue: noticeForm.targetValue,
        senderRole: 'Faculty',
        senderName: user.name,
        senderEmail: user.email,
        createdAt: Timestamp.now()
      });
      alert("Announcement sent!");
      setNoticeForm({ ...noticeForm, text: '' });
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
      alert("Error sending announcement");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFacultyRecord?.id) return;
    if (newPassword !== confirmPassword) { alert("Passwords do not match!"); return; }
    setPasswordLoading(true);
    try {
      await updateDoc(doc(db, 'faculty', currentFacultyRecord.id), { password: newPassword });
      alert("Password updated!");
      setNewPassword(''); setConfirmPassword('');
    } catch (err) { alert("Failed to update password."); }
    finally { setPasswordLoading(false); }
  };

  const handleDeleteEntry = async (col: string, id: string) => {
    if (window.confirm("Delete this entry permanently?")) {
      try { 
        await deleteDoc(doc(db, col, id)); 
        if (selectedHwId === id) setSelectedHwId(null);
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleToggleCompletion = async (student: any, homeworkId: string, currentCompletion: any) => {
    try {
      if (currentCompletion) {
        await deleteDoc(doc(db, 'homework_completion', currentCompletion.id));
      } else {
        await addDoc(collection(db, 'homework_completion'), {
          homeworkId: homeworkId,
          studentEmail: student.email,
          studentName: student.name,
          completed: true,
          completedBy: 'Faculty',
          completedAt: Timestamp.now()
        });
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#384959]">👨‍🏫 Expert Console</h2>
            <div className="px-4 py-2 bg-[#88BDF2]/10 border border-[#88BDF2]/20 rounded-xl">
              <span className="text-[9px] md:text-[10px] font-black text-[#384959] uppercase tracking-widest">Active Session: {selectedMonth}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard title="Monthly Slots" value={myClasses.length} color="#88BDF2" textColor="#384959" />
            <StatCard title="Assignments" value={pendingHomeworkCount} color="#384959" textColor="white" />
            <StatCard title="Students" value={batchStudentsCount} color="#BDDDFC" textColor="#384959" />
          </div>
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#384959] mb-6 flex items-center text-sm md:text-base"><span className="text-[#88BDF2] mr-2 text-xl">⏰</span> Upcoming Classes</h3>
            <div className="space-y-3">
              {myClasses.slice(0, 3).map((t, idx) => (
                <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="bg-[#384959] text-white p-2 md:p-3 rounded-xl mr-4 min-w-[60px] md:min-w-[70px] text-center shrink-0">
                    <p className="text-[8px] md:text-[10px] opacity-60">TIME</p>
                    <p className="text-[10px] md:text-xs font-black">{t.displayStartTime?.split(' ')[0]}</p>
                  </div>
                  <div className="flex-grow truncate">
                    <p className="text-[10px] md:text-xs font-black text-[#384959] uppercase truncate">{t.batch}</p>
                    <p className="text-[9px] md:text-[10px] text-[#6A89A7] truncate">{t.classType}</p>
                  </div>
                </div>
              ))}
              {myClasses.length === 0 && <p className="text-center py-4 text-slate-400 italic text-sm">No classes found.</p>}
            </div>
          </div>
        </div>
      );

    case 'inbox_view':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <h3 className="text-xl md:text-2xl font-bold text-[#384959]">✉️ Inbox</h3>
          <div className="space-y-4">
            {relevantNotices.map(n => (
              <div key={n.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                <p className="text-[9px] md:text-[10px] font-black text-[#88BDF2] uppercase mb-2">From: {n.senderName}</p>
                <p className="text-[#384959] font-medium text-sm md:text-base leading-relaxed">{n.text}</p>
              </div>
            ))}
            {relevantNotices.length === 0 && <p className="text-center py-20 text-slate-400 italic text-sm">No incoming announcements.</p>}
          </div>
        </div>
      );

    case 'timetable_view':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">📅 My Schedule</h3>
            <div className="w-full md:w-48"><SelectField value={selectedMonth} options={MONTHS} onChange={setSelectedMonth} /></div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-[#6A89A7] border-b">
                  <tr><th className="px-8 py-5">Timing</th><th className="px-8 py-5">Batch</th><th className="px-8 py-5">Type</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {myClasses.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-[#384959] text-sm">{t.displayStartTime} - {t.displayEndTime}</td>
                      <td className="px-8 py-5 text-[11px] md:text-xs font-black uppercase">{t.batch}</td>
                      <td className="px-8 py-5"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] md:text-[10px] font-black uppercase">{t.classType}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'marks_add':
      return (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#384959]">🏆 Upload Marks</h3>
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <SelectField label="Batch" value={marksBatch} options={Object.values(BATCH_CONFIG).flat()} onChange={setMarksBatch} />
              <SelectField label="Test" value={marksTestType} options={TEST_TYPES} onChange={setMarksTestType} />
              <SelectField label="Subject" value={marksSubject} options={Object.values(SUBJECT_CONFIG).flat()} onChange={setMarksSubject} />
              <InputField label="Total" type="number" value={totalMarks} onChange={setTotalMarks} />
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Student Scores</h4>
              {students.filter(s => s.batch === marksBatch).map(student => (
                <div key={student.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="font-bold text-[#384959] text-sm">{student.name}</p>
                  <input type="number" placeholder="Score" value={studentScores[student.email] || ''} onChange={(e) => setStudentScores({...studentScores, [student.email]: e.target.value})} className="w-24 md:w-32 px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-[#384959] focus:ring-2 focus:ring-[#88BDF2] outline-none text-sm" />
                </div>
              ))}
              {students.filter(s => s.batch === marksBatch).length === 0 && (
                <p className="text-center py-10 text-slate-400 italic text-sm">No students in this batch.</p>
              )}
            </div>
            <button onClick={handleAddMarks} disabled={loading} className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#4a5f75]">{loading ? "Uploading..." : "Submit Marks"}</button>
          </div>
        </div>
      );

    case 'homework_add':
      return (
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#384959]">📝 Post Assignment</h3>
          <form onSubmit={handleAddHomework} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
            <InputField label="Title" value={hwForm.title} onChange={(v: string) => setHwForm({...hwForm, title: v})} required />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-70 ml-2 tracking-widest">Description</label>
              <textarea value={hwForm.description} onChange={(e) => setHwForm({...hwForm, description: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 min-h-[120px] font-bold text-sm text-[#384959] focus:bg-white focus:ring-4 focus:ring-[#88BDF2]/20 outline-none transition-all" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Target Batch" value={hwForm.batch} options={Object.values(BATCH_CONFIG).flat()} onChange={(v: string) => setHwForm({...hwForm, batch: v})} />
              <InputField label="Deadline" type="date" value={hwForm.deadline} onChange={(v: string) => setHwForm({...hwForm, deadline: v})} required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase shadow-lg tracking-widest text-xs">{loading ? "Posting..." : "Post Homework"}</button>
          </form>
        </div>
      );

    case 'homework_all':
      const selectedHw = myHomework.find(h => h.id === selectedHwId);
      
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">📚 Assignments</h3>
            {selectedHwId && (
              <button onClick={() => setSelectedHwId(null)} className="text-[10px] font-black text-[#88BDF2] uppercase tracking-widest hover:underline">← Back</button>
            )}
          </div>

          {!selectedHwId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myHomework.map(h => {
                const completions = homeworkCompletions.filter(c => c.homeworkId === h.id && c.completed).length;
                const totalInBatch = students.filter(s => s.batch === h.batch).length;

                return (
                  <div key={h.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 group md:hover:border-[#88BDF2] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] md:text-[10px] font-black text-[#88BDF2] uppercase">{h.batch}</span>
                      <button onClick={() => handleDeleteEntry('homework', h.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-full transition-all">🗑️</button>
                    </div>
                    <h4 className="font-bold text-[#384959] text-base md:text-lg mb-2">{h.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{h.description}</p>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Submissions</p>
                        <p className="text-xs md:text-sm font-black text-[#384959]">{completions} / {totalInBatch}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedHwId(h.id)}
                        className="bg-[#384959] text-white px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#4a5f75] transition-all"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                );
              })}
              {myHomework.length === 0 && <p className="col-span-2 text-center py-20 text-slate-400 italic text-sm">No homework history found.</p>}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-[#384959] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white">
                <h4 className="text-xl md:text-2xl font-black mb-2">{selectedHw?.title}</h4>
                <p className="text-white/60 text-xs md:text-sm mb-6 leading-relaxed">{selectedHw?.description}</p>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">Batch: {selectedHw?.batch}</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-amber-400">Due: {selectedHw?.deadline}</span>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-[#6A89A7] border-b">
                      <tr><th className="px-8 py-5">Student Name</th><th className="px-8 py-5">Email</th><th className="px-8 py-5 text-right">Status Toggle</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.filter(s => s.batch === selectedHw?.batch).map(s => {
                        const completion = homeworkCompletions.find(c => c.homeworkId === selectedHwId && c.studentEmail === s.email && c.completed);
                        const isCompleted = !!completion;
                        return (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5 font-bold text-[#384959] text-sm">{s.name}</td>
                            <td className="px-8 py-5 text-xs text-slate-400">{s.email}</td>
                            <td className="px-8 py-5 text-right">
                              <button 
                                onClick={() => handleToggleCompletion(s, selectedHwId!, completion)}
                                className={`px-4 py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${isCompleted ? 'bg-green-100 text-green-600 border border-green-200 hover:bg-green-200' : 'bg-amber-100 text-amber-600 border border-amber-200 hover:bg-amber-200'}`}
                              >
                                {isCompleted ? 'Completed' : 'Pending'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'faculty_broadcast':
      return (
        <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#384959]">📢 Broadcast</h3>
          <form onSubmit={handleAddNotice} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
            <SelectField label="Target Batch" value={noticeForm.targetValue} options={Object.values(BATCH_CONFIG).flat()} onChange={(v: string) => setNoticeForm({...noticeForm, targetValue: v})} />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-70 ml-2 tracking-widest">Message Content</label>
              <textarea value={noticeForm.text} onChange={(e) => setNoticeForm({...noticeForm, text: e.target.value})} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 min-h-[150px] font-bold text-sm text-[#384959] focus:bg-white focus:ring-4 focus:ring-[#88BDF2]/20 outline-none transition-all" placeholder="Important update for the batch..." required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg">{loading ? "Sending..." : "Send Announcement"}</button>
          </form>
        </div>
      );

    case 'settings_faculty':
      return (
        <div className="max-w-xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100">
             <h4 className="font-black text-[#384959] text-[10px] md:text-sm uppercase mb-8 tracking-widest">Portal Security</h4>
             <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <InputField label="New Password" type="password" value={newPassword} onChange={setNewPassword} required />
                <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
                <button type="submit" disabled={passwordLoading} className="w-full bg-[#384959] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg">{passwordLoading ? 'Updating...' : 'Save Changes'}</button>
             </form>
          </div>
        </div>
      );

    default: return null;
  }
};
