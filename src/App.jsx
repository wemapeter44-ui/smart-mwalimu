import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { usePushNotifications } from './hooks/usePushNotifications';
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

function AppShell({ activePage, setActivePage, sidebarOpen, setSidebarOpen }) {
  usePushNotifications();

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
    <div className="min-h-screen bg-[#0a1628] flex">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-x-hidden relative min-w-0">
        <div
          className="fixed inset-0 pointer-events-none lg:ml-64"
          style={{
            backgroundImage: 'url(/ribeboys-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
          }}
        />
        <div className="relative z-10">
          <TopBar
            title={TITLES[activePage] || 'Smart Mwalimu'}
            onMenuClick={() => setSidebarOpen(o => !o)}
          />
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [authView, setAuthView] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <NotificationProvider>
      <AppShell
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </NotificationProvider>
  );
}

export default App;