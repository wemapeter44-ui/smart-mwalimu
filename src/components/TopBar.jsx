import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTeacher } from '../contexts/TeacherContext';
import { useNotifications } from '../contexts/NotificationContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useToast } from '../contexts/ToastContext';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TopBar({ title, onMenuClick }) {
  const { user } = useAuth();
  const { teacher } = useTeacher();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { status: pushStatus, enable: enablePush } = usePushNotifications();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleEnablePush() {
    const ok = await enablePush();
    if (ok) toast.success('Notifications enabled on this device.', 'Enabled');
    else toast.error('Could not enable notifications. Check browser settings.');
  }

  const showEnableBtn = pushStatus !== 'subscribed' && pushStatus !== 'unsupported';

  return (
    <header className="h-14 bg-[#0d1e35] border-b border-blue-900/40 flex items-center justify-between gap-3 px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md hover:bg-blue-900/40 text-blue-200 flex-shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {showEnableBtn && (
          <button
            onClick={handleEnablePush}
            className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 rounded-md px-2.5 py-1.5 transition"
            title="Enable notifications on this device"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
            </svg>
            Enable alerts
          </button>
        )}

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="relative p-2 rounded-md hover:bg-blue-900/40 text-blue-200"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#0d1e35] border border-blue-900/40 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-blue-900/40">
                <span className="text-xs font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] text-blue-400 hover:text-blue-200">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-blue-400 text-center py-6">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`w-full text-left px-3 py-2.5 border-b border-blue-900/20 hover:bg-blue-900/30 transition ${
                        n.read ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          n.type === 'success' ? 'bg-green-400' :
                          n.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                          {n.message && <p className="text-[11px] text-blue-300 line-clamp-2">{n.message}</p>}
                          <p className="text-[10px] text-blue-500 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-blue-900/40">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(teacher?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-xs font-semibold text-white leading-tight truncate">{teacher?.name || 'Teacher'}</p>
            <p className="text-[10px] text-blue-400 leading-tight truncate">{teacher?.subject || user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}