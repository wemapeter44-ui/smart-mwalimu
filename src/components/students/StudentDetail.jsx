import { useEffect, useState } from 'react';
import { fetchStudentStats } from '../../hooks/useClassStudents';

function Stat({ label, value, accent = 'text-white', hint }) {
  return (
    <div className="bg-[#0a1628] border border-blue-900/40 rounded-md p-3">
      <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-lg font-bold mt-1 ${accent}`}>{value}</p>
      {hint && <p className="text-[10px] text-blue-500 mt-0.5">{hint}</p>}
    </div>
  );
}

function TrendChart({ points }) {
  if (!points || points.length < 2) {
    return (
      <div className="h-24 flex items-center justify-center text-[11px] text-blue-500 border border-blue-900/40 rounded-md">
        Need at least 2 marks to show trend
      </div>
    );
  }

  const width = 260;
  const height = 80;
  const pad = 8;
  const maxScore = 100;
  const stepX = (width - pad * 2) / (points.length - 1);
  const yFor = (score) => height - pad - (score / maxScore) * (height - pad * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * stepX} ${yFor(p.score)}`)
    .join(' ');

  const areaPath =
    linePath +
    ` L ${pad + (points.length - 1) * stepX} ${height - pad}` +
    ` L ${pad} ${height - pad} Z`;

  return (
    <div className="bg-[#0a1628] border border-blue-900/40 rounded-md p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
        {/* baseline at 50% */}
        <line
          x1={pad} x2={width - pad}
          y1={yFor(50)} y2={yFor(50)}
          stroke="rgb(30, 58, 138)" strokeDasharray="3 3" strokeWidth="1"
        />
        <path d={areaPath} fill="rgba(59,130,246,0.12)" />
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={pad + i * stepX}
            cy={yFor(p.score)}
            r="3"
            fill="#3b82f6"
          >
            <title>{`${p.subject} · ${p.label}: ${p.score}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[9px] text-blue-500 mt-1">
        <span>Oldest</span>
        <span>Latest</span>
      </div>
    </div>
  );
}

export default function StudentDetail({ student, onClose, onRemove }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setStats(null);
    fetchStudentStats(student.id).then(s => {
      if (alive) { setStats(s); setLoading(false); }
    });
    return () => { alive = false; };
  }, [student.id]);

  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-5 sticky top-20">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white truncate">{student.name}</h3>
          <p className="text-xs text-blue-400 mt-0.5">
            Adm: {student.admission_no}
            {student.form && <span className="ml-2">• {student.form}{student.stream ? ` ${student.stream}` : ''}</span>}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-blue-400 hover:text-white text-lg leading-none flex-shrink-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-blue-400 text-center py-6">Loading stats...</p>
      ) : (
        <>
          {/* Row 1: main stats */}
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Average"
              value={stats.average != null ? `${stats.average}%` : '—'}
              accent={
                stats.average == null ? 'text-blue-400' :
                stats.average >= 70 ? 'text-green-400' :
                stats.average >= 50 ? 'text-amber-400' : 'text-red-400'
              }
              hint={stats.marksCount ? `${stats.marksCount} marks` : 'No marks yet'}
            />
            <Stat
              label="Attendance"
              value={stats.attendance.percent != null ? `${stats.attendance.percent}%` : '—'}
              accent={
                stats.attendance.percent == null ? 'text-blue-400' :
                stats.attendance.percent >= 80 ? 'text-green-400' :
                stats.attendance.percent >= 60 ? 'text-amber-400' : 'text-red-400'
              }
              hint={`${stats.attendance.present}P / ${stats.attendance.absent}A${stats.attendance.late ? ' / ' + stats.attendance.late + 'L' : ''}`}
            />
          </div>

          {/* Trend pill */}
          {stats.trend && (
            <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-md border ${
              stats.trend === 'up' ? 'border-green-500/40 bg-green-500/10 text-green-300' :
              stats.trend === 'down' ? 'border-red-500/40 bg-red-500/10 text-red-300' :
              'border-blue-900/40 bg-blue-900/20 text-blue-300'
            }`}>
              <span className="text-base leading-none">
                {stats.trend === 'up' ? '▲' : stats.trend === 'down' ? '▼' : '▬'}
              </span>
              <span>
                {stats.trend === 'up' && `Improving (+${stats.trendDelta} vs last)`}
                {stats.trend === 'down' && `Declining (${stats.trendDelta} vs last)`}
                {stats.trend === 'flat' && `Stable (${stats.trendDelta >= 0 ? '+' : ''}${stats.trendDelta} vs last)`}
              </span>
            </div>
          )}

          {/* Trend chart */}
          {stats.trendPoints.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-2">
                Performance Trend
              </p>
              <TrendChart points={stats.trendPoints} />
            </div>
          )}

          {/* Subject breakdown */}
          {stats.subjectBreakdown.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-2">
                By Subject
              </p>
              <div className="space-y-2">
                {stats.subjectBreakdown.map(s => (
                  <div key={s.subject}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-200 flex-1 truncate">{s.subject}</span>
                      <span className="text-[10px] text-blue-500">{s.count}x</span>
                      <span className="text-xs font-semibold text-white w-9 text-right">{s.average}%</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          s.average >= 70 ? 'bg-green-500' :
                          s.average >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, s.average)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-blue-500 mt-0.5">
                      Best {s.best} · Worst {s.worst}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent marks */}
          {stats.recentMarks.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-2">
                Recent Marks
              </p>
              <div className="space-y-1.5">
                {stats.recentMarks.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <p className="text-blue-200 truncate">
                        {m.subject}
                        {m.exam_name && <span className="text-blue-500 ml-1">· {m.exam_name}</span>}
                      </p>
                      {(m.term || m.date) && (
                        <p className="text-[10px] text-blue-500">
                          {m.term}{m.term && m.date ? ' • ' : ''}{m.date}
                        </p>
                      )}
                    </div>
                    <span className={`font-semibold flex-shrink-0 ${
                      m.score >= 70 ? 'text-green-400' :
                      m.score >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {m.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onRemove(student)}
            className="mt-5 w-full text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-md py-2 transition"
          >
            Remove student
          </button>
        </>
      )}
    </div>
  );
}