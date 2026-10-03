import { useState, useMemo } from 'react';
import { useTeacher } from '../contexts/TeacherContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useClassStudents } from '../hooks/useClassStudents';
import StudentDetail from '../components/students/StudentDetail';
import AddStudentModal from '../components/students/AddStudentModal';

export default function Students() {
  const { teacher, isClassTeacher } = useTeacher();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { students, loading, error, addStudent, removeStudent } = useClassStudents();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.admission_no || '').toLowerCase().includes(q)
    );
  }, [students, search]);

  if (!isClassTeacher || !teacher?.class_form) {
    return (
      <div className="p-6">
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-8 text-center">
          <h2 className="text-sm font-semibold text-white">Not a class teacher</h2>
          <p className="text-xs text-blue-400 mt-2">
            Student roster is only available to form teachers. Contact admin if this is wrong.
          </p>
        </div>
      </div>
    );
  }

  const classLabel = `${teacher.class_form}${teacher.class_stream ? ' ' + teacher.class_stream : ''}`;

  async function handleRemove(student) {
    const ok = await confirm({
      title: 'Remove student?',
      message: `${student.name} will be permanently removed from ${classLabel}. Attendance and marks history will also be deleted.`,
      confirmText: 'Remove',
      danger: true,
    });
    if (!ok) return;
    try {
      await removeStudent(student.id);
      toast.success(`${student.name} removed.`, 'Student removed');
      setSelected(null);
    } catch (err) {
      toast.error(err.message || 'Failed to remove student.');
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">My Class — {classLabel}</h1>
          <p className="text-xs text-blue-400 mt-1">
            {students.length} student{students.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition"
        >
          + Add student
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or admission no..."
          className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-6 text-center">
              <p className="text-xs text-blue-400">Loading students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-10 text-center">
              <p className="text-sm text-blue-300">
                {search ? 'No students match your search.' : 'No students in your class yet.'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-3 text-xs text-blue-300 hover:text-white underline"
                >
                  Add your first student
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-900/40">
                    <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-4 py-2.5">#</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-4 py-2.5">Name</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-4 py-2.5 hidden sm:table-cell">Admission</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const isSel = selected?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className={`cursor-pointer border-b border-blue-900/20 transition ${
                          isSel ? 'bg-blue-900/40' : 'hover:bg-blue-900/20'
                        }`}
                      >
                        <td className="px-4 py-2.5 text-xs text-blue-500">{i + 1}</td>
                        <td className="px-4 py-2.5 text-sm text-white">{s.name}</td>
                        <td className="px-4 py-2.5 text-xs text-blue-300 hidden sm:table-cell">{s.admission_no}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selected ? (
            <StudentDetail
              student={selected}
              onClose={() => setSelected(null)}
              onRemove={handleRemove}
            />
          ) : (
            <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-6 text-center sticky top-20">
              <p className="text-xs text-blue-400">Select a student to view stats</p>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddStudentModal
          classLabel={classLabel}
          onClose={() => setShowAdd(false)}
          onSubmit={addStudent}
        />
      )}
    </div>
  );
}