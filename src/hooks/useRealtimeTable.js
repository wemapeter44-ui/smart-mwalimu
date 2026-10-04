import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeTable(table, onChange, options = {}) {
  const { filter, enabled = true } = options;
  const onChangeRef = useRef(onChange);
  const channelRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled || !table) return;

    const channelName = `rt-${table}-${filter || 'all'}`;
    let channel;

    try {
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            ...(filter ? { filter } : {}),
          },
          (payload) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              onChangeRef.current?.({
                eventType: payload.eventType,
                new: payload.new,
                old: payload.old,
              });
            }, 250);
          }
        )
        .subscribe();
      channelRef.current = channel;
    } catch (e) {
      console.warn(`Realtime subscribe failed for ${table}:`, e?.message);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, enabled]);
}