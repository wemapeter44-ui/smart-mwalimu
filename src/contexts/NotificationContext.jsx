import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // Table might not exist yet — fail silently
      if (error.code !== 'PGRST205') {
        console.warn('Notification fetch skipped:', error.message);
      }
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    let channel;
    try {
      channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
          }
        )
        .subscribe();
    } catch (e) {
      // ignore — table not ready
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [user]);

  async function markAsRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllAsRead() {
    if (!user) return;
    const ids = notifications.filter(n => !n.read).map(n => n.id);
    if (!ids.length) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', ids);
    if (error) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markAsRead, markAllAsRead, refresh: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}