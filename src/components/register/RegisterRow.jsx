export default function RegisterRow({ index, student, status, onSet }) {
  return (
    <tr className="border-b border-blue-900/20">
      <td className="px-3 py-2.5 text-xs text-blue-500">{index + 1}</td>
      <td className="px-3 py-2.5 text-sm text-white">{student.name}</td>
      <td className="px-3 py-2.5 text-xs text-blue-300 hidden sm:table-cell">
        {student.admission_no}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => onSet(student.id, 'present')}
            className={`text-[11px] font-semibold px-3 py-1 rounded-md transition ${
              status === 'present'
                ? 'bg-green-600 text-white'
                : 'bg-[#0a1628] border border-blue-900/60 text-blue-300 hover:border-green-600/60 hover:text-green-400'
            }`}
          >
            Present
          </button>
          <button
            type="button"
            onClick={() => onSet(student.id, 'absent')}
            className={`text-[11px] font-semibold px-3 py-1 rounded-md transition ${
              status === 'absent'
                ? 'bg-red-600 text-white'
                : 'bg-[#0a1628] border border-blue-900/60 text-blue-300 hover:border-red-600/60 hover:text-red-400'
            }`}
          >
            Absent
          </button>
        </div>
      </td>
    </tr>
  );
}