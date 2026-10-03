import { useState, useMemo } from 'react';
import { useResources } from '../hooks/useResources';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { SUBJECTS } from '../lib/constants';
import ResourceCard from '../components/resources/ResourceCard';
import ResourceModal from '../components/resources/ResourceModal';

export default function Resources() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const {
    items, loading, error, hasMore,
    loadMore, createResource, updateResource, deleteResource,
  } = useResources();

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(r => {
      if (subjectFilter && r.subject !== subjectFilter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.subject || '').toLowerCase().includes(q)
      );
    });
  }, [items, search, subjectFilter]);

  async function handleSubmit(payload) {
    try {
      if (editing?.id) {
        await updateResource(editing.id, payload);
        toast.success('Resource updated.', 'Saved');
      } else {
        await createResource(payload);
        toast.success('Resource added to library.', 'Added');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save resource.');
      throw err;
    }
  }

  async function handleDelete(item) {
    const ok = await confirm({
      title: 'Delete resource?',
      message: `"${item.title}" will be permanently removed.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteResource(item.id);
      toast.success('Resource deleted.', 'Deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">Resources</h1>
          <p className="text-xs text-blue-400 mt-1">
            {items.length} resource{items.length === 1 ? '' : 's'} shared by staff
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition"
        >
          + Add resource
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search title, description..."
          className="sm:col-span-2 bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          className="bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-6 text-center">
          <p className="text-xs text-blue-400">Loading resources...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-10 text-center">
          <p className="text-sm text-blue-300">
            {search || subjectFilter ? 'No resources match your filters.' : 'No resources yet.'}
          </p>
          {!search && !subjectFilter && (
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="mt-3 text-xs text-blue-300 hover:text-white underline"
            >
              Add the first resource
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <ResourceCard
              key={item.id}
              item={item}
              onEdit={(r) => { setEditing(r); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))}

          {hasMore && !search && !subjectFilter && (
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
        <ResourceModal
          initial={editing}
          onSubmit={handleSubmit}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}