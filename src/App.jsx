import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import ClassRegister from './pages/ClassRegister';
import Timetable from './pages/Timetable';
import Announcements from './pages/Announcements';
import Marks from './pages/Marks';
import Resources from './pages/Resources';

const TITLES = {
  dashboard: 'Dashboard',
  timetable: 'My Timetable',
  students: 'Students',
  'class-register': 'Class Register',
  marks: 'Marks',
  announcements: 'Announcements',
  resources: 'Resources',
};

function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [authView, setAuthView] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <p className="text-blue-300 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return authView === 'login'
      ? <Login onSwitchToSignUp={() => setAuthView('signup')} />
      : <SignUp onSwitchToLogin={() => setAuthView('login')} />;
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'timetable': return <Timetable />;
      case 'students': return <Students />;
      case 'class-register': return <ClassRegister />;
      case 'marks': return <Marks />;
      case 'announcements': return <Announcements />;
      case 'resources': return <Resources />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#0a1628] flex">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-x-hidden relative min-w-0">
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/ribeboys-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginLeft: '16rem',
              opacity: 0.08,
            }}
          />
          <div className="relative z-10">
            <TopBar title={TITLES[activePage] || 'Smart Mwalimu'} />
            {renderPage()}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}

export default App;