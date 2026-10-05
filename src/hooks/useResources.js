import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTeacher } from '../contexts/TeacherContext';
import { usePolling } from './usePolling';

const PAGE_SIZE = 10;

export function useResources() {
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
      .from('resources')
      .select('*')
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

  usePolling(() => load(0, false), 15000);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(next, true);
  }

  async function createResource({ title, description, link, subject }) {
    if (!teacher) throw new Error('No teacher profile.');
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        link: link.trim(),
        subject: subject || null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    setItems(prev => [data, ...prev]);
    return data;
  }

  async function updateResource(id, { title, description, link, subject }) {
    const { error } = await supabase
      .from('resources')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        link: link.trim(),
        subject: subject || null,
      })
      .eq('id', id);
    if (error) throw error;
    setItems(prev => prev.map(r => r.id === id
      ? { ...r, title: title.trim(), description: description?.trim() || null, link: link.trim(), subject: subject || null }
      : r
    ));
  }

  async function deleteResource(id) {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw error;
    setItems(prev => prev.filter(r => r.id !== id));
  }

  return {
    items, loading, error, hasMore,
    refresh: () => load(0, false),
    loadMore,
    createResource,
    updateResource,
    deleteResource,
  };
}