import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | unsupported | denied | subscribed | error
  const [error, setError] = useState(null);

  // Silent check (no prompt) — updates status if already granted
  useEffect(() => {
    if (!user) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setStatus('subscribed');
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      setStatus('denied');
    }
  }, [user]);

  // Called from a button click — Chrome needs user gesture
  const enable = useCallback(async () => {
    if (!user) return false;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return false;
    }
    if (!VAPID_PUBLIC_KEY) {
      setError('VAPID public key missing.');
      setStatus('error');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setStatus('denied');
        return false;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const json = sub.toJSON();
      const payload = {
        user_id: user.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent.slice(0, 200),
      };

      const { error: upsertErr } = await supabase
        .from('push_subscriptions')
        .upsert(payload, { onConflict: 'endpoint' });
      if (upsertErr) throw upsertErr;

      setStatus('subscribed');
      return true;
    } catch (e) {
      console.error('Push enable error:', e);
      setError(e.message);
      setStatus('error');
      return false;
    }
  }, [user]);

  return { status, error, enable };
}