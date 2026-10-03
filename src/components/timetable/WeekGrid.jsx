import { DAYS } from '../../lib/constants';
import ClassCard from './ClassCard';

export default function WeekGrid({ classes, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {DAYS.map(d => {
        const dayClasses = classes
          .filter(c => Number(c.day) === d.value)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));

        return (
          <div key={d.value} className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{d.long}</h3>
              <span className="text-[10px] text-blue-500">{dayClasses.length}</span>
            </div>
            {dayClasses.length === 0 ? (
              <p className="text-[11px] text-blue-500 py-4 text-center">No classes</p>
            ) : (
              <div className="space-y-2">
                {dayClasses.map(cls => (
                  <ClassCard
                    key={cls.id}
                    cls={cls}
                    showStatus={false}
                    compact
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}