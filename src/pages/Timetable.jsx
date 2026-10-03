import { useEffect, useState, useMemo } from 'react';
import { useTeacherTimetable } from '../hooks/useTeacherTimetable';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { classStatus, prettyDate, todayDayNumber } from '../lib/dates';
import ClassCard from '../components/timetable/ClassCard';
import AddClassModal from '../components/timetable/AddClassModal';
import WeekGrid from '../components/timetable/WeekGrid';

export default function Timetable() {
  const { classes, loading, error, addClass, updateClass, deleteClass } = useTeacherTimetable();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [tab, setTab] = useState('today');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayClasses = useMemo(() => {
    return classes
      .filter(c => Number(c.day) === todayDayNumber())
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [classes]);

  async function handleDelete(cls) {
    const ok = await confirm({
      title: 'Delete class?',
      message: `${cls.subject} — ${cls.form}${cls.stream ? ' ' + cls.stream : ''} will be removed from your timetable.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteClass(cls.id);
      toast.success('Class removed from timetable.', 'Deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete class.');
    }
  }

  async function handleSave(payload) {
    if (editing?.id) {
      await updateClass(editing.id, payload);
      toast.success('Class updated.', 'Saved');
    } else {
      await addClass(payload);
      toast.success('Class added to timetable.', 'Saved');
    }
    setEditing(null);
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-blue-300 text-sm">Loading timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">My Timetable</h1>
          <p className="text-xs text-blue-400 mt-1">
            {tab === 'today' ? prettyDate() : `${classes.length} classes across the week`}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowAdd(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition"
        >
          + Add class
        </button>
      </div>

      <div className="flex gap-1 mb-5 border-b border-blue-900/40">
        <TabBtn active={tab === 'today'} onClick={() => setTab('today')}>Today</TabBtn>
        <TabBtn active={tab === 'week'} onClick={() => setTab('week')}>Week</TabBtn>
      </div>

      {tab === 'today' ? (
        todayClasses.length === 0 ? (
          <div className="rounded-lg border border-blue-900/40 bg-[#0d1e35] p-10 text-center">
            <p className="text-sm text-blue-300">No classes scheduled for today.</p>
            <button
              onClick={() => { setEditing(null); setShowAdd(true); }}
              className="mt-3 text-xs text-blue-300 hover:text-white underline"
            >
              Add a class
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayClasses.map(cls => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onEdit={(c) => { setEditing(c); setShowAdd(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      ) : (
        classes.length === 0 ? (
          <div className="rounded-lg border border-blue-900/40 bg-[#0d1e35] p-10 text-center">
            <p className="text-sm text-blue-300">Your timetable is empty.</p>
            <button
              onClick={() => { setEditing(null); setShowAdd(true); }}
              className="mt-3 text-xs text-blue-300 hover:text-white underline"
            >
              Add your first class
            </button>
          </div>
        ) : (
          <WeekGrid
            classes={classes}
            onEdit={(c) => { setEditing(c); setShowAdd(true); }}
            onDelete={handleDelete}
          />
        )
      )}

      {showAdd && (
        <AddClassModal
          initial={editing}
          onSubmit={handleSave}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-semibold transition border-b-2 -mb-px ${
        active
          ? 'border-blue-500 text-white'
          : 'border-transparent text-blue-400 hover:text-blue-200'
      }`}
    >
      {children}
    </button>
  );
}