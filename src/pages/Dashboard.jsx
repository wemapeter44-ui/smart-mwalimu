import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTeacher } from '../contexts/TeacherContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatTime, classStatus } from '../lib/dates';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function displayName(teacher, user) {
  const raw = teacher?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Teacher';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const { teacher, isClassTeacher } = useTeacher();
  const { unreadCount } = useNotifications();
  const { stats, announcements, loading } = useDashboardStats();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {greeting()}, {displayName(teacher, user)}
        </h1>
        <p className="text-sm text-blue-400 mt-1">
          {today}
          {teacher?.subject && <span className="ml-2">• {teacher.subject} Department</span>}
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Today's Classes"
          value={loading ? '—' : stats.todaysClasses.length}
          accent="text-blue-300"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <StatCard
          label="Next Class"
          value={loading ? '—' : stats.nextClass ? formatTime(stats.nextClass.start_time) : 'None'}
          accent="text-green-400"
          hint={stats.nextClass ? `${stats.nextClass.subject} • ${stats.nextClass.form}` : 'All clear for today'}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          label={isClassTeacher ? 'My Students' : 'Alerts'}
          value={loading ? '—' : isClassTeacher ? stats.studentsCount : unreadCount}
          accent="text-white"
          hint={isClassTeacher
            ? (teacher?.class_form ? `${teacher.class_form}${teacher.class_stream ? ' ' + teacher.class_stream : ''}` : '')
            : (unreadCount ? 'Unread notifications' : 'All caught up')}
          icon={isClassTeacher
            ? 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
            : 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0'}
        />
        <StatCard
          label="Unread Alerts"
          value={loading ? '—' : unreadCount}
          accent={unreadCount > 0 ? 'text-amber-400' : 'text-blue-300'}
          hint={unreadCount > 0 ? 'Tap bell to view' : 'No new alerts'}
          icon="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
        />
      </div>

      {/* Class teacher row */}
      {isClassTeacher && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
          <StatCard
            label="Attendance Today"
            value={loading ? '—' : stats.attendanceMarked ? 'Marked' : 'Pending'}
            accent={stats.attendanceMarked ? 'text-green-400' : 'text-amber-400'}
            hint={stats.attendanceMarked ? 'Register submitted' : 'Mark your class register'}
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
          <StatCard
            label="Class Average"
            value={loading ? '—' : stats.classAverage != null ? `${stats.classAverage}%` : 'No data'}
            accent="text-blue-300"
            hint={stats.classAverage != null ? 'All subjects this term' : 'Marks not recorded yet'}
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </div>
      )}

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Today's lessons */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Today's Lessons</h2>
            <button
              onClick={() => onNavigate && onNavigate('timetable')}
              className="text-[11px] text-blue-400 hover:text-blue-200"
            >
              View timetable →
            </button>
          </div>
          {loading ? (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-6 text-center">
              <p className="text-xs text-blue-400">Loading...</p>
            </div>
          ) : stats.todaysClasses.length === 0 ? (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-8 text-center">
              <p className="text-sm text-blue-300">No lessons scheduled today</p>
              <p className="text-xs text-blue-500 mt-1">Enjoy the free day.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.todaysClasses.slice(0, 5).map(cls => {
                const status = classStatus(cls.start_time, cls.end_time);
                const dot =
                  status === 'in-progress' ? 'bg-green-400' :
                  status === 'upcoming' ? 'bg-blue-400' : 'bg-blue-800';
                return (
                  <div
                    key={cls.id}
                    className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {cls.subject}
                        <span className="text-blue-400 font-normal ml-2">
                          {cls.form}{cls.stream ? ` ${cls.stream}` : ''}
                        </span>
                      </p>
                      <p className="text-[11px] text-blue-400">
                        {formatTime(cls.start_time)} – {formatTime(cls.end_time)}
                        {cls.room && <span className="ml-2">• {cls.room}</span>}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-blue-500 flex-shrink-0">
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Recent Announcements</h2>
            <button
              onClick={() => onNavigate && onNavigate('announcements')}
              className="text-[11px] text-blue-400 hover:text-blue-200"
            >
              View all →
            </button>
          </div>
          {loading ? (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-6 text-center">
              <p className="text-xs text-blue-400">Loading...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-8 text-center">
              <p className="text-sm text-blue-300">No announcements yet</p>
              <p className="text-xs text-blue-500 mt-1">Check back later.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.map(a => (
                <div
                  key={a.id}
                  className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-3"
                >
                  <p className="text-sm text-white font-medium truncate">{a.title}</p>
                  {a.message && (
                    <p className="text-xs text-blue-300 mt-0.5 line-clamp-2">{a.message}</p>
                  )}
                  <p className="text-[10px] text-blue-500 mt-1.5">
                    {a.author || 'Admin'} • {timeAgo(a.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'text-white', hint, icon }) {
  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">
          {label}
        </p>
        {icon && (
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d={icon} />
          </svg>
        )}
      </div>
      <p className={`text-2xl font-bold mt-2 ${accent}`}>{value}</p>
      {hint && <p className="text-[10px] text-blue-500 mt-1 truncate">{hint}</p>}
    </div>
  );
}