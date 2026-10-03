import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeTable(table, onChange, options = {}) {
  const { filter, enabled = true } = options;

  useEffect(() => {
    if (!enabled || !table) return;

    const channelName = `rt-${table}-${filter || 'all'}-${Math.random().toString(36).slice(2, 8)}`;

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
            onChange?.({
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
            });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn(`Realtime subscribe failed for ${table}:`, e?.message);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [table, filter, enabled, onChange]);
}