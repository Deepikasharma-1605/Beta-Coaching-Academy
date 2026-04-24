
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { COURSES, BATCH_CONFIG, SUBJECT_CONFIG, MONTHS, CLASS_TYPES } from '../types';
import { StatCard, InputField, SelectField } from './DashboardUI';

// Moved outside to prevent re-creation on every render which causes instability
const FilterContainer = ({ children }: { children?: React.ReactNode }) => (
  <div className="bg-slate-50 p-4 md:p-6 rounded-[2rem] border border-slate-200/60 mb-8 space-y-4 md:space-y-6">
    {children}
  </div>
);

const FilterGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] md:w-24 shrink-0">{label}</span>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const PillButton = ({ active, onClick, children, colorType = 'primary' }: any) => {
  const activeStyles = colorType === 'primary' 
    ? 'bg-[#384959] text-[#fbbf24] shadow-lg shadow-[#384959]/20' 
    : 'bg-[#88BDF2] text-[#384959] shadow-md shadow-[#88BDF2]/20';
  
  return (
    <button 
      onClick={onClick} 
      className={`px-4 md:px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${active ? activeStyles : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
    >
      {children}
    </button>
  );
};

interface AdminPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  students: any[];
  faculty: any[];
  admins: any[];
  notices: any[];
  timetable: any[];
  settings?: any;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  activeTab, 
  setActiveTab, 
  students, 
  faculty, 
  admins,
  notices, 
  timetable,
  settings 
}) => {
  // Student Filter State
  const [studentFilterCourse, setStudentFilterCourse] = useState<string>('All');
  const [studentFilterBatch, setStudentFilterBatch] = useState<string>('All');

  // Faculty Filter State
  const [facultyFilterCourse, setFacultyFilterCourse] = useState<string>('All');
  const [facultyFilterSubject, setFacultyFilterSubject] = useState<string>('All');

  // Timetable Form State
  const [ttForm, setTtForm] = useState({
    type: 'Student' as 'Student' | 'Faculty',
    month: MONTHS[new Date().getMonth()],
    batch: BATCH_CONFIG['JEE'][0],
    facultyEmail: '',
    subject: SUBJECT_CONFIG['JEE'][0],
    startTime: '08:00',
    endTime: '10:00',
    classType: 'Normal Class'
  });

  // Broadcast State
  const [broadcastTarget, setBroadcastTarget] = useState<'Faculty' | 'Students' | null>(null);
  const [broadcastLevel1, setBroadcastLevel1] = useState<string>('All'); 
  const [broadcastLevel2, setBroadcastLevel2] = useState<string>('All'); 
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Forms
  const [studentForm, setStudentForm] = useState({ name: '', email: '', course: 'JEE', batch: 'JEE 11th', password: '', phone: '' });
  const [facultyForm, setFacultyForm] = useState({ name: '', email: '', subject: 'Maths', course: 'JEE', password: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  
  // Settings State
  const [instName, setInstName] = useState(settings?.instituteName || 'Beta Academy');
  const [lockMarks, setLockMarks] = useState(settings?.lockMarks || false);
  const [lockTimetable, setLockTimetable] = useState(settings?.lockTimetable || false);

  // CRITICAL: Reset everything when switching tabs so features open from the "beginning"
  useEffect(() => {
    setStudentFilterCourse('All');
    setStudentFilterBatch('All');
    setFacultyFilterCourse('All');
    setFacultyFilterSubject('All');
    setBroadcastTarget(null);
    setBroadcastLevel1('All');
    setBroadcastLevel2('All');
    setBroadcastMessage('');
    setStudentForm({ name: '', email: '', course: 'JEE', batch: 'JEE 11th', password: '', phone: '' });
    setFacultyForm({ name: '', email: '', subject: 'Maths', course: 'JEE', password: '' });
    setAdminForm({ name: '', email: '', password: '' });
    setTtForm({
      type: 'Student',
      month: MONTHS[new Date().getMonth()],
      batch: BATCH_CONFIG['JEE']?.[0] || '',
      facultyEmail: faculty[0]?.email || '',
      subject: SUBJECT_CONFIG['JEE']?.[0] || '',
      startTime: '08:00',
      endTime: '10:00',
      classType: 'Normal Class'
    });
    setInstName(settings?.instituteName || 'Beta Academy');
    setLockMarks(settings?.lockMarks || false);
    setLockTimetable(settings?.lockTimetable || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleDelete = async (col: string, id: string) => {
    if (window.confirm("Remove this entry permanently?")) {
      try { await deleteDoc(doc(db, col, id)); } catch (err) { alert("Delete failed"); }
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'students'), { ...studentForm, createdAt: Timestamp.now() });
      alert("Student added!");
      setStudentForm({ name: '', email: '', course: 'JEE', batch: 'JEE 11th', password: '', phone: '' });
      setActiveTab('students_all');
    } catch (err) { alert("Error adding student"); }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'faculty'), { ...facultyForm, createdAt: Timestamp.now() });
      alert("Faculty added!");
      setFacultyForm({ name: '', email: '', subject: 'Maths', course: 'JEE', password: '' });
      setActiveTab('faculty_all');
    } catch (err) { alert("Error adding faculty"); }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'admins'), { ...adminForm, createdAt: Timestamp.now() });
      alert("New Administrator added!");
      setAdminForm({ name: '', email: '', password: '' });
      setActiveTab('admins_all');
    } catch (err) { alert("Error adding admin"); }
  };

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const displayStartTime = ttForm.startTime;
      const displayEndTime = ttForm.endTime;
      
      await addDoc(collection(db, 'timetable'), {
        ...ttForm,
        displayStartTime,
        displayEndTime,
        createdAt: Timestamp.now()
      });
      alert("Timetable entry synchronized!");
    } catch (err) { alert("Error synchronizing timetable"); }
  };

  const handleUpdateSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        instituteName: instName,
        lockMarks: lockMarks,
        lockTimetable: lockTimetable,
        updatedAt: Timestamp.now()
      });
      alert("Global settings updated!");
    } catch (err) { alert("Failed to save settings"); }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTarget || !broadcastMessage.trim()) {
      alert("Please select a target and enter a message.");
      return;
    }

    setIsSendingBroadcast(true);
    try {
      let targetType = '';
      if (broadcastTarget === 'Students') {
        if (broadcastLevel1 === 'All') targetType = 'Students';
        else if (broadcastLevel2 === 'All') targetType = 'StudentCategory';
        else targetType = 'Batch';
      } else {
        if (broadcastLevel1 === 'All') targetType = 'Faculty';
        else if (broadcastLevel2 === 'All') targetType = 'FacultyCategory';
        else targetType = 'FacultySubject';
      }

      const targetValue = broadcastLevel2 !== 'All' ? broadcastLevel2 : (broadcastLevel1 !== 'All' ? broadcastLevel1 : 'All');

      await addDoc(collection(db, 'notices'), {
        text: broadcastMessage,
        target: targetType,
        targetValue: targetValue,
        senderRole: 'Admin',
        senderName: 'Institute Administration',
        createdAt: Timestamp.now()
      });

      alert("Broadcast sent successfully!");
      setBroadcastMessage('');
      setBroadcastTarget(null);
    } catch (err) {
      alert("Failed to send broadcast.");
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const courseMatch = studentFilterCourse === 'All' || s.course === studentFilterCourse;
    const batchMatch = studentFilterBatch === 'All' || s.batch === studentFilterBatch;
    return courseMatch && batchMatch;
  });

  const filteredFaculty = faculty.filter(f => {
    const courseMatch = facultyFilterCourse === 'All' || f.course === facultyFilterCourse;
    const subjectMatch = facultyFilterSubject === 'All' || f.subject === facultyFilterSubject;
    return courseMatch && subjectMatch;
  });

  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#384959]">📊 Academy Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Students" value={students.length} color="#88BDF2" textColor="#384959" />
            <StatCard title="Faculty" value={faculty.length} color="#384959" textColor="white" />
            <StatCard title="Batches" value={Object.values(BATCH_CONFIG).flat().length} color="#fbbf24" textColor="#384959" />
            <StatCard title="Admin" value={admins.length + 1} color="#f8fafc" textColor="#384959" />
          </div>
        </div>
      );

    case 'students_all':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">👨‍🎓 Student Roster</h3>
            <button onClick={() => setActiveTab('students_add')} className="w-full md:w-auto bg-[#384959] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#4a5f75] transition-all shadow-lg">+ Register Student</button>
          </div>

          <FilterContainer>
            <FilterGroup label="Branch">
              <PillButton active={studentFilterCourse === 'All'} onClick={() => { setStudentFilterCourse('All'); setStudentFilterBatch('All'); }}>All Programs</PillButton>
              {COURSES.map(c => (
                <PillButton key={c} active={studentFilterCourse === c} onClick={() => { setStudentFilterCourse(c); setStudentFilterBatch('All'); }}>{c}</PillButton>
              ))}
            </FilterGroup>
            {studentFilterCourse !== 'All' && (
              <FilterGroup label="Batch">
                <PillButton colorType="secondary" active={studentFilterBatch === 'All'} onClick={() => setStudentFilterBatch('All')}>Show All {studentFilterCourse}</PillButton>
                {BATCH_CONFIG[studentFilterCourse].map(b => (
                  <PillButton key={b} colorType="secondary" active={studentFilterBatch === b} onClick={() => setStudentFilterBatch(b)}>{b}</PillButton>
                ))}
              </FilterGroup>
            )}
          </FilterContainer>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <tr>
                    <th className="px-8 py-6">Student</th>
                    <th className="px-8 py-6">Branch</th>
                    <th className="px-8 py-6 text-right">Batch Details</th>
                    <th className="px-8 py-6 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-[#384959]">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{s.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-[#88BDF2]/10 text-[#384959] rounded-lg text-[9px] font-black uppercase">{s.course}</span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-[#384959] text-xs uppercase tracking-tight">{s.batch}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDelete('students', s.id)} className="text-red-400 hover:text-red-600 transition-all p-2 rounded-full hover:bg-red-50">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-20 text-slate-400 italic text-sm">No students found matching filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'faculty_all':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">👨‍🏫 Academic Experts</h3>
            <button onClick={() => setActiveTab('faculty_add')} className="w-full md:w-auto bg-[#88BDF2] text-[#384959] px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#BDDDFC] transition-all shadow-lg">+ Onboard Faculty</button>
          </div>

          <FilterContainer>
            <FilterGroup label="Branch">
              <PillButton active={facultyFilterCourse === 'All'} onClick={() => { setFacultyFilterCourse('All'); setFacultyFilterSubject('All'); }}>All Branches</PillButton>
              {COURSES.map(c => (
                <PillButton key={c} active={facultyFilterCourse === c} onClick={() => { setFacultyFilterCourse(c); setFacultyFilterSubject('All'); }}>{c}</PillButton>
              ))}
            </FilterGroup>
            {facultyFilterCourse !== 'All' && (
              <FilterGroup label="Subject">
                <PillButton colorType="secondary" active={facultyFilterSubject === 'All'} onClick={() => setFacultyFilterSubject('All')}>All {facultyFilterCourse} Subjects</PillButton>
                {SUBJECT_CONFIG[facultyFilterCourse].map(s => (
                  <PillButton key={s} colorType="secondary" active={facultyFilterSubject === s} onClick={() => setFacultyFilterSubject(s)}>{s}</PillButton>
                ))}
              </FilterGroup>
            )}
          </FilterContainer>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <tr>
                    <th className="px-8 py-6">Expert Name</th>
                    <th className="px-8 py-6">Branch</th>
                    <th className="px-8 py-6 text-right">Specialization</th>
                    <th className="px-8 py-6 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredFaculty.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-[#384959]">{f.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{f.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg text-[9px] font-black uppercase">{f.course}</span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-[#384959] text-xs uppercase tracking-tight">{f.subject}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDelete('faculty', f.id)} className="text-red-400 hover:text-red-600 transition-all p-2 rounded-full hover:bg-red-50">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {filteredFaculty.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-20 text-slate-400 italic text-sm">No experts found matching filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'timetable_manage':
      return (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">📅 Timetable Orchestration</h3>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-8 md:space-y-10">
            <div className="flex gap-2 md:gap-4 p-1.5 md:p-2 bg-slate-50 rounded-2xl w-fit">
              <button 
                onClick={() => setTtForm({...ttForm, type: 'Student'})} 
                className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${ttForm.type === 'Student' ? 'bg-[#384959] text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
              >
                For Students
              </button>
              <button 
                onClick={() => setTtForm({...ttForm, type: 'Faculty'})} 
                className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${ttForm.type === 'Faculty' ? 'bg-[#384959] text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
              >
                For Faculty
              </button>
            </div>

            <form onSubmit={handleAddTimetable} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <SelectField label="Month" value={ttForm.month} options={MONTHS} onChange={(v: string) => setTtForm({...ttForm, month: v})} />
              
              {ttForm.type === 'Student' ? (
                <SelectField label="Target Batch" value={ttForm.batch} options={Object.values(BATCH_CONFIG).flat()} onChange={(v: string) => setTtForm({...ttForm, batch: v})} />
              ) : (
                <SelectField label="Faculty Expert" value={ttForm.facultyEmail} options={faculty.map(f => f.email)} onChange={(v: string) => setTtForm({...ttForm, facultyEmail: v})} />
              )}

              <SelectField label="Subject" value={ttForm.subject} options={Object.values(SUBJECT_CONFIG).flat()} onChange={(v: string) => setTtForm({...ttForm, subject: v})} />
              <InputField label="Starts At" type="time" value={ttForm.startTime} onChange={(v: string) => setTtForm({...ttForm, startTime: v})} />
              <InputField label="Ends At" type="time" value={ttForm.endTime} onChange={(v: string) => setTtForm({...ttForm, endTime: v})} />
              <SelectField label="Classification" value={ttForm.classType} options={CLASS_TYPES} onChange={(v: string) => setTtForm({...ttForm, classType: v})} />
              
              <div className="md:col-span-2 lg:col-span-3 pt-4">
                <button type="submit" className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-lg hover:bg-[#4a5f75] transition-all">
                  Commit To Schedule
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[600px]">
                  <tbody className="divide-y divide-slate-50">
                     {timetable.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-5">
                              <p className="font-bold text-[#384959]">{t.type === 'Student' ? t.batch : t.facultyEmail}</p>
                              <p className="text-[9px] text-[#88BDF2] font-black uppercase">{t.subject} • {t.classType}</p>
                           </td>
                           <td className="px-8 py-5 font-mono text-sm text-[#384959] font-bold">{t.displayStartTime} - {t.displayEndTime}</td>
                           <td className="px-8 py-5 font-black uppercase text-[10px] text-slate-400">{t.month}</td>
                           <td className="px-8 py-5 text-right">
                              <button onClick={() => handleDelete('timetable', t.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-full">🗑️</button>
                           </td>
                        </tr>
                     ))}
                     {timetable.length === 0 && <tr><td colSpan={4} className="text-center py-20 text-slate-400 italic">No schedules active.</td></tr>}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      );

    case 'settings_admin':
      return (
        <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#384959]">⚙️ Global Configuration</h3>
          
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8 md:space-y-10">
            <InputField label="Institute Public Name" value={instName} onChange={setInstName} />
            
            <div className="space-y-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Control Policies</label>
              
              <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl">
                <div className="pr-4">
                  <p className="font-bold text-[#384959] text-sm md:text-base">Lock Academic Marks</p>
                  <p className="text-[10px] md:text-xs text-slate-400">Prevents faculty from updating test scores</p>
                </div>
                <button onClick={() => setLockMarks(!lockMarks)} className={`w-12 md:w-14 h-6 md:h-8 rounded-full transition-all relative shrink-0 ${lockMarks ? 'bg-[#384959]' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-4 md:w-6 h-4 md:h-6 rounded-full bg-white transition-all ${lockMarks ? 'left-7 md:left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl">
                <div className="pr-4">
                  <p className="font-bold text-[#384959] text-sm md:text-base">Freeze Public Timetable</p>
                  <p className="text-[10px] md:text-xs text-slate-400">Hides the schedule from student view</p>
                </div>
                <button onClick={() => setLockTimetable(!lockTimetable)} className={`w-12 md:w-14 h-6 md:h-8 rounded-full transition-all relative shrink-0 ${lockTimetable ? 'bg-amber-400' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-4 md:w-6 h-4 md:h-6 rounded-full bg-white transition-all ${lockTimetable ? 'left-7 md:left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <button onClick={handleUpdateSettings} className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-lg hover:bg-[#4a5f75] transition-all">
              Apply Global Changes
            </button>
          </div>
        </div>
      );

    case 'notices_admin':
      return (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">📢 Institute Broadcast</h3>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-8 md:space-y-10">
            <div className="space-y-6">
              <FilterGroup label="Target Audience">
                <PillButton active={broadcastTarget === 'Students'} onClick={() => { setBroadcastTarget('Students'); setBroadcastLevel1('All'); setBroadcastLevel2('All'); }}>Students</PillButton>
                <PillButton active={broadcastTarget === 'Faculty'} onClick={() => { setBroadcastTarget('Faculty'); setBroadcastLevel1('All'); setBroadcastLevel2('All'); }}>Faculty</PillButton>
              </FilterGroup>

              {broadcastTarget && (
                <FilterGroup label="Program">
                  <PillButton colorType="secondary" active={broadcastLevel1 === 'All'} onClick={() => { setBroadcastLevel1('All'); setBroadcastLevel2('All'); }}>All {broadcastTarget}</PillButton>
                  {COURSES.map(c => (
                    <PillButton key={c} colorType="secondary" active={broadcastLevel1 === c} onClick={() => { setBroadcastLevel1(c); setBroadcastLevel2('All'); }}>{c}</PillButton>
                  ))}
                </FilterGroup>
              )}

              {broadcastTarget === 'Students' && broadcastLevel1 !== 'All' && (
                <FilterGroup label="Batch">
                  <PillButton active={broadcastLevel2 === 'All'} onClick={() => setBroadcastLevel2('All')}>All {broadcastLevel1} Batches</PillButton>
                  {BATCH_CONFIG[broadcastLevel1].map(b => (
                    <PillButton key={b} active={broadcastLevel2 === b} onClick={() => setBroadcastLevel2(b)}>{b}</PillButton>
                  ))}
                </FilterGroup>
              )}

              {broadcastTarget === 'Faculty' && broadcastLevel1 !== 'All' && (
                <FilterGroup label="Subject">
                  <PillButton active={broadcastLevel2 === 'All'} onClick={() => setBroadcastLevel2('All')}>All {broadcastLevel1} Faculty</PillButton>
                  {SUBJECT_CONFIG[broadcastLevel1].map(s => (
                    <PillButton key={s} active={broadcastLevel2 === s} onClick={() => setBroadcastLevel2(s)}>{s}</PillButton>
                  ))}
                </FilterGroup>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Broadcast Message</label>
              <textarea 
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full px-6 py-4 rounded-3xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#88BDF2]/20 outline-none transition-all font-medium text-[#384959] min-h-[150px]"
              />
            </div>

            <button 
              onClick={handleSendBroadcast}
              disabled={isSendingBroadcast || !broadcastTarget || !broadcastMessage.trim()}
              className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-lg hover:bg-[#4a5f75] transition-all disabled:opacity-50"
            >
              {isSendingBroadcast ? 'Dispatching Message...' : 'Dispatch Broadcast'}
            </button>
          </div>

          <div className="space-y-6 pt-10">
            <h4 className="text-sm font-black text-[#384959] uppercase tracking-widest flex items-center">
              <span className="mr-2">📜</span> Recent Dispatch History
            </h4>
            <div className="space-y-4">
              {notices.filter(n => n.senderRole === 'Admin').slice(0, 5).map(n => (
                <div key={n.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-start group hover:border-[#88BDF2] transition-colors">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.target} • {n.targetValue}</p>
                    <p className="text-[#384959] font-medium text-sm md:text-base">{n.text}</p>
                  </div>
                  <button onClick={() => handleDelete('notices', n.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-full transition-all">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'admins_all':
      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">🛡️ Admin Team</h3>
            <button onClick={() => setActiveTab('admins_add')} className="w-full md:w-auto bg-amber-400 text-[#384959] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-md">Add New Admin</button>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <tr><th className="px-8 py-6">Name</th><th className="px-8 py-6">Identifier</th><th className="px-8 py-6 text-right">Access Level</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="bg-[#BDDDFC]/10">
                    <td className="px-8 py-6 font-bold text-[#384959]">Super Admin <span className="ml-2 bg-[#384959] text-white px-2 py-0.5 rounded-full text-[8px] uppercase">Root</span></td>
                    <td className="px-8 py-6 text-sm text-slate-500">admin@gmail.com</td>
                    <td className="px-8 py-6 text-right text-[9px] text-[#384959] uppercase font-black tracking-widest">Master Portal</td>
                  </tr>
                  {admins.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-[#384959]">{a.name}</td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">{a.email}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDelete('admins', a.id)} className="text-red-400 hover:text-red-600 font-black text-[9px] uppercase tracking-widest">Revoke Control</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'admins_add':
      return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('admins_all')} className="text-slate-400 hover:text-[#384959] transition-colors font-black text-xs uppercase tracking-widest">← Back to List</button>
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">➕ Register Admin</h3>
          </div>
          <form onSubmit={handleAddAdmin} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <InputField label="Admin Name" value={adminForm.name} onChange={(v: string) => setAdminForm({...adminForm, name: v})} required />
              <InputField label="Portal Email" value={adminForm.email} onChange={(v: string) => setAdminForm({...adminForm, email: v})} required />
              <div className="md:col-span-2">
                <InputField label="Secure Password" type="password" value={adminForm.password} onChange={(v: string) => setAdminForm({...adminForm, password: v})} required />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-[#4a5f75] transition-all">Create Account</button>
          </form>
        </div>
      );

    case 'students_add':
      return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('students_all')} className="text-slate-400 hover:text-[#384959] transition-colors font-black text-xs uppercase tracking-widest">← Roster</button>
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">➕ New Registration</h3>
          </div>
          <form onSubmit={handleAddStudent} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <InputField label="Student Full Name" value={studentForm.name} onChange={(v: string) => setStudentForm({...studentForm, name: v})} required />
              <InputField label="Email Address" value={studentForm.email} onChange={(v: string) => setStudentForm({...studentForm, email: v})} required />
              <SelectField label="Program" value={studentForm.course} options={COURSES} onChange={(v: string) => setStudentForm({...studentForm, course: v, batch: BATCH_CONFIG[v][0]})} />
              <SelectField label="Batch Group" value={studentForm.batch} options={BATCH_CONFIG[studentForm.course]} onChange={(v: string) => setStudentForm({...studentForm, batch: v})} />
              <InputField label="Portal Password" type="password" value={studentForm.password} onChange={(v: string) => setStudentForm({...studentForm, password: v})} required />
              <InputField label="Primary Contact" value={studentForm.phone} onChange={(v: string) => setStudentForm({...studentForm, phone: v})} />
            </div>
            <button type="submit" className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-[#4a5f75] transition-all">Authorize Registration</button>
          </form>
        </div>
      );

    case 'faculty_add':
      return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('faculty_all')} className="text-slate-400 hover:text-[#384959] transition-colors font-black text-xs uppercase tracking-widest">← Experts List</button>
            <h3 className="text-xl md:text-2xl font-bold text-[#384959]">➕ Faculty Onboarding</h3>
          </div>
          <form onSubmit={handleAddFaculty} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <InputField label="Full Name" value={facultyForm.name} onChange={(v: string) => setFacultyForm({...facultyForm, name: v})} required />
              <InputField label="Official Email" value={facultyForm.email} onChange={(v: string) => setFacultyForm({...facultyForm, email: v})} required />
              <SelectField label="Branch" value={facultyForm.course} options={COURSES} onChange={(v: string) => setFacultyForm({...facultyForm, course: v, subject: SUBJECT_CONFIG[v][0]})} />
              <SelectField label="Specialization" value={facultyForm.subject} options={SUBJECT_CONFIG[facultyForm.course]} onChange={(v: string) => setFacultyForm({...facultyForm, subject: v})} />
              <InputField label="Default Password" type="password" value={facultyForm.password} onChange={(v: string) => setFacultyForm({...facultyForm, password: v})} required />
            </div>
            <button type="submit" className="w-full bg-[#384959] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-[#4a5f75] transition-all">Finalize Onboarding</button>
          </form>
        </div>
      );

    default: return null;
  }
};
