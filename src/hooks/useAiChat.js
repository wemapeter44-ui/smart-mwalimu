import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';

const SYSTEM_PROMPT = `You are Smart Mwalimu, an AI teaching assistant for teachers at The Ribe Boys High School in Kenya. The school follows Kenya's Competency-Based Curriculum (CBE) for Senior School (Grade 10-12).

Your role:
- Help teachers create lesson plans, schemes of work, and assessments aligned with CBE
- Generate exam questions (SBA and KCBE style) with marking schemes
- Explain subject concepts clearly for the teacher to teach
- Suggest competency-based activities and learning outcomes
- Draft teacher comments for report cards
- Respond in English or Kiswahili, whichever the teacher uses

Keep responses concise, practical, and formatted with clear headings or bullet points where helpful. Use CBE terminology (strands, sub-strands, core competencies, EE/ME/AE/BE levels).`;

export function useAiChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const loadChats = useCallback(async () => {
    if (!user) { setChats([]); setLoadingChats(false); return; }
    setLoadingChats(true);
    const { data, error } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) { setError(error.message); setChats([]); }
    else setChats(data || []);
    setLoadingChats(false);
  }, [user]);

  useEffect(() => { loadChats(); }, [loadChats]);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) { setMessages([]); return; }
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (!error) setMessages(data || []);
  }, []);

  async function createChat(title) {
    if (!user) throw new Error('Not signed in.');
    const { data, error } = await supabase
      .from('ai_chats')
      .insert({ user_id: user.id, title: title || 'New chat' })
      .select()
      .single();
    if (error) throw error;
    setChats(prev => [data, ...prev]);
    setCurrentChat(data);
    setMessages([]);
    return data;
  }

  async function selectChat(chat) {
    setCurrentChat(chat);
    await loadMessages(chat.id);
  }

  async function deleteChat(chatId) {
    const { error } = await supabase.from('ai_chats').delete().eq('id', chatId);
    if (error) throw error;
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
  }

  async function renameChat(chatId, title) {
    const { error } = await supabase
      .from('ai_chats')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', chatId);
    if (error) throw error;
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    if (!GEMINI_API_KEY) throw new Error('Gemini API key missing.');
    if (!user) throw new Error('Not signed in.');

    let chat = currentChat;
    if (!chat) {
      chat = await createChat(text.slice(0, 60));
    }

    setSending(true);
    setError(null);

    const userMsg = {
      chat_id: chat.id,
      role: 'user',
      content: text.trim(),
    };

    const localUserMsg = { id: 'tmp-u-' + Date.now(), ...userMsg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, localUserMsg]);

    const { error: uErr } = await supabase.from('ai_messages').insert(userMsg);
    if (uErr) {
      setSending(false);
      setError(uErr.message);
      return;
    }

    const history = [...messages, localUserMsg].map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    try {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: history,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Gemini error ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const json = await res.json();
      const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '(No response)';

      const assistantMsg = {
        chat_id: chat.id,
        role: 'assistant',
        content: reply,
      };

      const { data: savedAssistant, error: aErr } = await supabase
        .from('ai_messages')
        .insert(assistantMsg)
        .select()
        .single();

      if (!aErr && savedAssistant) {
        setMessages(prev => [...prev, savedAssistant]);
      } else {
        setMessages(prev => [...prev, { id: 'tmp-a-' + Date.now(), ...assistantMsg, created_at: new Date().toISOString() }]);
      }

      await supabase
        .from('ai_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chat.id);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        chat_id: chat.id,
        role: 'assistant',
        content: `⚠️ ${err.message}`,
        created_at: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setSending(false);
    }
  }

  return {
    chats, currentChat, messages,
    loadingChats, sending, error,
    createChat, selectChat, deleteChat, renameChat, sendMessage,
    refreshChats: loadChats,
  };
}