import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTeacher } from '../contexts/TeacherContext';
import { usePolling } from './usePolling';

const PAGE_SIZE = 10;

export function useAnnouncements() {
  const { user } = useAuth();
  const { teacher } = useTeacher();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (pageNum = 0, append = false) => {
    if (!append) setLoading(true);
    setError(null);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      setError(error.message);
      if (!append) setItems([]);
    } else {
      const list = data || [];
      setItems(prev => (append ? [...prev, ...list] : list));
      setHasMore(list.length === PAGE_SIZE);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(0, false); setPage(0); }, [load]);

  // Poll every 15s — silent refresh of page 0
  usePolling(() => load(0, false), 15000);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(next, true);
  }

  async function createAnnouncement({ title, message, audience, audience_subject }) {
    if (!teacher) throw new Error('No teacher profile.');
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: title.trim(),
        message: message.trim(),
        author: teacher.name || user?.email || 'Teacher',
        author_id: user?.id,
        audience: audience || 'all',
        audience_subject: audience === 'department' ? audience_subject : null,
        pinned: false,
      })
      .select()
      .single();

    if (error) throw error;

    setItems(prev => {
      const pinned = prev.filter(a => a.pinned);
      const rest = prev.filter(a => !a.pinned);
      return [...pinned, data, ...rest];
    });

    try {
      await dispatchNotifications({ title, message, audience, audience_subject, excludeUserId: user?.id });
    } catch (e) {
      console.warn('Notification dispatch failed:', e.message);
    }

    return data;
  }

  async function updateAnnouncement(id, { title, message, audience, audience_subject, pinned }) {
    const { error } = await supabase
      .from('announcements')
      .update({
        title: title.trim(),
        message: message.trim(),
        audience,
        audience_subject: audience === 'department' ? audience_subject : null,
        pinned: !!pinned,
      })
      .eq('id', id);
    if (error) throw error;
    setItems(prev => prev.map(a => a.id === id
      ? { ...a, title: title.trim(), message: message.trim(), audience, audience_subject: audience === 'department' ? audience_subject : null, pinned: !!pinned }
      : a
    ));
  }

  async function deleteAnnouncement(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    setItems(prev => prev.filter(a => a.id !== id));
  }

  async function togglePin(item) {
    const { error } = await supabase
      .from('announcements')
      .update({ pinned: !item.pinned })
      .eq('id', item.id);
    if (error) throw error;
    setItems(prev => {
      const updated = prev.map(a => a.id === item.id ? { ...a, pinned: !a.pinned } : a);
      const pinned = updated.filter(a => a.pinned);
      const rest = updated.filter(a => !a.pinned);
      return [...pinned, ...rest];
    });
  }

  return {
    items, loading, error, hasMore,
    refresh: () => load(0, false),
    loadMore,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePin,
  };
}

async function dispatchNotifications({ title, message, audience, audience_subject, excludeUserId }) {
  let q = supabase.from('teachers').select('user_id, subject, subjects');
  if (audience === 'department' && audience_subject) {
    q = q.eq('subject', audience_subject);
  }

  const { data: teachers, error } = await q;
  if (error) throw error;

  const recipients = (teachers || [])
    .map(t => t.user_id)
    .filter(uid => uid && uid !== excludeUserId);

  if (!recipients.length) return;

  const rows = recipients.map(uid => ({
    user_id: uid,
    title: `Announcement: ${title}`,
    message: message.slice(0, 140),
    type: 'info',
    link: 'announcements',
    read: false,
    created_by: excludeUserId,
  }));

  const { error: insErr } = await supabase.from('notifications').insert(rows);
  if (insErr) throw insErr;
}