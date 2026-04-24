
import React, { useState, useEffect } from 'react';
import { User, UserRole, MONTHS } from '../types';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, where, Unsubscribe } from 'firebase/firestore';
import { NavTab, NavParent, NavSub } from './DashboardUI';
import { AdminPanel } from './AdminPanel';
import { FacultyPanel } from './FacultyPanel';
import { StudentPanel } from './StudentPanel';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['students', 'faculty', 'admins_menu']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  
  // Test Filtering States (Elevated for query optimization)
  const [testFilter, setTestFilter] = useState('Weekly');
  const [testSeriesSubFilter, setTestSeriesSubFilter] = useState('1');

  // Profile State
  const [userProfile, setUserProfile] = useState<any>(null);

  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [homeworkCompletions, setHomeworkCompletions] = useState<any[]>([]);
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    let profileUnsub: Unsubscribe | null = null;
    
    if (user.role === UserRole.STUDENT) {
      const q = query(collection(db, 'students'), where('email', '==', user.email));
      profileUnsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) setUserProfile(snapshot.docs[0].data());
      });
    } else if (user.role === UserRole.FACULTY) {
      const q = query(collection(db, 'faculty'), where('email', '==', user.email));
      profileUnsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) setUserProfile(snapshot.docs[0].data());
      });
    }

    return () => profileUnsub?.();
  }, [user.email, user.role]);

  useEffect(() => {
    const unsubs: Unsubscribe[] = [];

    const createListener = (colName: string, q: any, setter: (data: any[]) => void) => {
      const unsub = onSnapshot(q, (snapshot: any) => {
        setter(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      });
      unsubs.push(unsub);
    };

    if (user.role === UserRole.ADMIN) {
      createListener('students', collection(db, 'students'), setStudents);
      createListener('faculty', collection(db, 'faculty'), setFaculty);
      createListener('admins', collection(db, 'admins'), setAdmins);
      createListener('notices', query(collection(db, 'notices'), orderBy('createdAt', 'desc')), setNotices);
      createListener('marks', collection(db, 'marks'), setMarks);
      createListener('timetable', query(collection(db, 'timetable'), orderBy('createdAt', 'desc')), setTimetable);
      createListener('homework', query(collection(db, 'homework'), orderBy('createdAt', 'desc')), setHomework);
      createListener('homework_completion', collection(db, 'homework_completion'), setHomeworkCompletions);
    } 
    else if (user.role === UserRole.STUDENT && userProfile) {
      const studentBatch = userProfile.batch;
      const studentCourse = userProfile.course;

      setStudents([{ ...userProfile, id: 'current' }]);
      
      // OPTIMIZATION: Read marks only for the selected test category from Firestore
      const effectiveTestType = testFilter === 'Test Series' ? `Test Series ${testSeriesSubFilter}` : testFilter;
      createListener('marks', query(
        collection(db, 'marks'), 
        where('studentEmail', '==', user.email),
        where('testType', '==', effectiveTestType)
      ), setMarks);
      
      createListener('timetable', query(
        collection(db, 'timetable'), 
        where('batch', '==', studentBatch),
        where('month', '==', selectedMonth)
      ), setTimetable);
      
      createListener('homework', query(collection(db, 'homework'), where('batch', '==', studentBatch)), setHomework);
      createListener('homework_completion', query(collection(db, 'homework_completion'), where('studentEmail', '==', user.email)), setHomeworkCompletions);

      createListener('notices', query(collection(db, 'notices'), orderBy('createdAt', 'desc')), (allNotices) => {
        const filtered = allNotices.filter((n: any) => 
          (n.target === 'Students' && n.targetValue === 'All') ||
          (n.target === 'StudentCategory' && n.targetValue === studentCourse) ||
          (n.target === 'Batch' && n.targetValue === studentBatch)
        );
        setNotices(filtered);
      });
    }
    else if (user.role === UserRole.FACULTY && userProfile) {
      const facultyCourse = userProfile.course;
      createListener('students', query(collection(db, 'students'), where('course', '==', facultyCourse)), setStudents);
      createListener('timetable', query(
        collection(db, 'timetable'), 
        where('facultyEmail', '==', user.email),
        where('month', '==', selectedMonth)
      ), setTimetable);
      createListener('homework', query(collection(db, 'homework'), where('facultyEmail', '==', user.email)), setHomework);
      createListener('homework_completion', collection(db, 'homework_completion'), setHomeworkCompletions);
      createListener('marks', query(collection(db, 'marks'), where('facultyEmail', '==', user.email)), setMarks);

      createListener('notices', query(collection(db, 'notices'), orderBy('createdAt', 'desc')), (allNotices) => {
        const filtered = allNotices.filter((n: any) => 
          (n.target === 'Faculty' && n.targetValue === 'All') ||
          (n.target === 'FacultyCategory' && n.targetValue === facultyCourse) ||
          (n.target === 'Batch' && n.senderEmail === user.email)
        );
        setNotices(filtered);
      });
    }

    return () => unsubs.forEach(unsub => unsub());
  }, [user.role, user.email, userProfile, selectedMonth, testFilter, testSeriesSubFilter]);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen p-0 md:p-6 lg:p-10 font-sans">
      <div className="md:hidden bg-[#0a192f] text-white p-5 flex justify-between items-center sticky top-0 z-[60] shadow-xl">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-[#0a192f] font-black mr-4 shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">{user.name}</p>
            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl border border-white/10"
        >
          <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto min-h-screen md:min-h-[85vh] flex flex-col md:flex-row gap-6">
        <aside className={`
          fixed inset-0 z-50 transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0 md:z-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          w-full md:w-[320px] bg-[#0a192f] text-white flex flex-col shrink-0 md:rounded-[2.5rem] shadow-2xl overflow-hidden
        `}>
          <div className="p-10 pb-6 hidden md:block border-b border-white/5">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-[#0a192f] font-black text-2xl shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="font-black text-lg truncate tracking-tight text-white">{user.name.split(' ')[0]}</h3>
                <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:hidden flex justify-end">
             <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black">✕</button>
          </div>

          <nav className="flex-grow py-6 md:py-8 overflow-y-auto px-6 space-y-2">
            {user.role === UserRole.ADMIN && (
              <>
                <NavTab id="overview" label="Insight Dashboard" icon="📊" active={activeTab} onClick={handleTabChange} />
                <NavParent id="students" label="Student Center" icon="👨‍🎓" expanded={expandedMenus.includes('students')} onToggle={() => toggleMenu('students')}>
                  <NavSub id="students_all" label="Directory" active={activeTab} onClick={handleTabChange} />
                  <NavSub id="students_add" label="New Admission" active={activeTab} onClick={handleTabChange} />
                </NavParent>
                <NavParent id="faculty" label="Faculty Board" icon="👨‍🏫" expanded={expandedMenus.includes('faculty')} onToggle={() => toggleMenu('faculty')}>
                  <NavSub id="faculty_all" label="Academic Staff" active={activeTab} onClick={handleTabChange} />
                  <NavSub id="faculty_add" label="Recruitment" active={activeTab} onClick={handleTabChange} />
                </NavParent>
                <NavParent id="admins_menu" label="Administration" icon="🛡️" expanded={expandedMenus.includes('admins_menu')} onToggle={() => toggleMenu('admins_menu')}>
                  <NavSub id="admins_all" label="Team Management" active={activeTab} onClick={handleTabChange} />
                  <NavSub id="admins_add" label="Grant Access" active={activeTab} onClick={handleTabChange} />
                </NavParent>
                <NavTab id="notices_admin" label="Broadcast Hub" icon="📢" active={activeTab} onClick={handleTabChange} />
                <NavTab id="timetable_manage" label="Timetable Engine" icon="📅" active={activeTab} onClick={handleTabChange} />
                <NavTab id="settings_admin" label="Global Settings" icon="⚙️" active={activeTab} onClick={handleTabChange} />
              </>
            )}

            {user.role === UserRole.FACULTY && (
              <>
                <NavTab id="overview" label="Expert Overview" icon="📊" active={activeTab} onClick={handleTabChange} />
                <NavTab id="inbox_view" label="Internal Inbox" icon="✉️" active={activeTab} onClick={handleTabChange} />
                <NavTab id="timetable_view" label="Assigned Classes" icon="📅" active={activeTab} onClick={handleTabChange} />
                <NavParent id="homework" label="Assignments" icon="📝" expanded={expandedMenus.includes('homework')} onToggle={() => toggleMenu('homework')}>
                  <NavSub id="homework_add" label="Create Task" active={activeTab} onClick={handleTabChange} />
                  <NavSub id="homework_all" label="Submission Log" active={activeTab} onClick={handleTabChange} />
                </NavParent>
                <NavTab id="faculty_broadcast" label="Batch Announce" icon="📢" active={activeTab} onClick={handleTabChange} />
                {!settings?.lockMarks && <NavTab id="marks_add" label="Grading Center" icon="🏆" active={activeTab} onClick={handleTabChange} />}
                <NavTab id="settings_faculty" label="My Account" icon="⚙️" active={activeTab} onClick={handleTabChange} />
              </>
            )}

            {user.role === UserRole.STUDENT && (
              <>
                <NavTab id="overview" label="Study Home" icon="🏠" active={activeTab} onClick={handleTabChange} />
                <NavTab id="messages_view" label="Notices" icon="✉️" active={activeTab} onClick={handleTabChange} />
                {!settings?.lockTimetable && <NavTab id="timetable_view" label="Class Schedule" icon="📅" active={activeTab} onClick={handleTabChange} />}
                <NavTab id="homework_view" label="Homework" icon="📝" active={activeTab} onClick={handleTabChange} />
                <NavTab id="marks_view" label="Test Reports" icon="📊" active={activeTab} onClick={handleTabChange} />
                <NavTab id="settings_student" label="Settings" icon="⚙️" active={activeTab} onClick={handleTabChange} />
              </>
            )}
          </nav>

          <div className="p-8 border-t border-white/5">
            <button 
              onClick={onLogout} 
              className="w-full bg-red-500/10 text-red-400 py-4 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all tracking-[0.2em]"
            >
              LOGOUT SESSION
            </button>
          </div>
        </aside>

        <main className="flex-grow md:rounded-[2.5rem] bg-white shadow-2xl overflow-hidden flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-[#0a192f] to-amber-400"></div>
          <div className="flex-grow overflow-y-auto p-6 md:p-10 lg:p-14 custom-scrollbar">
            <div className="max-w-6xl mx-auto">
              {user.role === UserRole.ADMIN ? (
                <AdminPanel 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  students={students} 
                  faculty={faculty} 
                  admins={admins}
                  notices={notices} 
                  timetable={timetable}
                  settings={settings}
                />
              ) : user.role === UserRole.FACULTY ? (
                <FacultyPanel
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  user={user}
                  students={students}
                  faculty={faculty}
                  timetable={timetable}
                  homework={homework}
                  homeworkCompletions={homeworkCompletions}
                  marks={marks}
                  syllabus={syllabus}
                  tests={tests}
                  notices={notices}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                />
              ) : user.role === UserRole.STUDENT ? (
                <StudentPanel
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  user={user}
                  notices={notices}
                  timetable={timetable}
                  homework={homework}
                  homeworkCompletions={homeworkCompletions}
                  marks={marks}
                  syllabus={syllabus}
                  students={students}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  testFilter={testFilter}
                  setTestFilter={setTestFilter}
                  testSeriesSubFilter={testSeriesSubFilter}
                  setTestSeriesSubFilter={setTestSeriesSubFilter}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-40">
                   <div className="text-8xl mb-6">🏛️</div>
                   <p className="text-2xl font-black uppercase tracking-widest text-[#0a192f]">Beta Academy Portal</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0a192f]/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
