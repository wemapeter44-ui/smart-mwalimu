import { useAuth } from '../contexts/AuthContext';
import { useTeacher } from '../contexts/TeacherContext';

function Sidebar({ activePage, onNavigate }) {
  const { signOut } = useAuth();
  const { isClassTeacher } = useTeacher();

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'timetable', label: 'Timetable', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'students', label: 'Students', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ...(isClassTeacher ? [{ id: 'class-register', label: 'Class Register', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }] : []),
    { id: 'marks', label: 'Marks', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
    { id: 'announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { id: 'resources', label: 'Resources', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <aside className="w-64 bg-[#0d1e35] border-r border-blue-900/40 min-h-screen flex flex-col">
      <div className="p-5 border-b border-blue-900/40 flex items-center gap-3">
        <img src="/ribeboys-logo.webp" alt="Ribe Boys" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">SMART MWALIMU</h1>
          <p className="text-[10px] text-blue-400 mt-0.5">Ribe Boys High School</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
              activePage === link.id
                ? 'bg-blue-600 text-white'
                : 'text-blue-300 hover:bg-blue-900/40 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={link.icon} />
            </svg>
            <span className="truncate">{link.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-blue-900/40">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>

      <div className="px-4 py-2 text-[10px] text-blue-500 text-center border-t border-blue-900/40">
        © 2026 PDT Softwares
      </div>
    </aside>
  );
}

export default Sidebar;