import { useState, useMemo } from 'react';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import AnnouncementCard from '../components/announcements/AnnouncementCard';
import AnnouncementModal from '../components/announcements/AnnouncementModal';

export default function Announcements() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const {
    items, loading, error, hasMore,
    refresh, loadMore,
    createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin,
  } = useAnnouncements();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      (a.author || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  async function handleSubmit(payload) {
    try {
      if (editing?.id) {
        await updateAnnouncement(editing.id, payload);
        toast.success('Announcement updated.', 'Saved');
      } else {
        await createAnnouncement(payload);
        toast.success('Announcement posted. Staff notified.', 'Posted');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save announcement.');
      throw err;
    }
  }

  async function handleDelete(item) {
    const ok = await confirm({
      title: 'Delete announcement?',
      message: `"${item.title}" will be permanently removed.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteAnnouncement(item.id);
      toast.success('Announcement deleted.', 'Deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  }

  async function handleTogglePin(item) {
    try {
      await togglePin(item);
      toast.success(item.pinned ? 'Unpinned.' : 'Pinned to top.', 'Updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update.');
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">Announcements</h1>
          <p className="text-xs text-blue-400 mt-1">
            {items.length} post{items.length === 1 ? '' : 's'} • visible to staff
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition"
        >
          + New announcement
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search title, message, or author..."
          className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-6 text-center">
          <p className="text-xs text-blue-400">Loading announcements...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-10 text-center">
          <p className="text-sm text-blue-300">
            {search ? 'No announcements match your search.' : 'No announcements yet.'}
          </p>
          {!search && (
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="mt-3 text-xs text-blue-300 hover:text-white underline"
            >
              Post the first one
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <AnnouncementCard
              key={item.id}
              item={item}
              onEdit={(i) => { setEditing(i); setShowModal(true); }}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}

          {hasMore && !search && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="text-xs text-blue-300 hover:text-white px-4 py-2 rounded-md border border-blue-900/60 hover:bg-blue-900/40 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <AnnouncementModal
          initial={editing}
          onSubmit={handleSubmit}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}