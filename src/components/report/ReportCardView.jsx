import CompetencyBadge from '../marks/CompetencyBadge';

const LEVEL_LABEL = {
  EE: 'Exceeding',
  ME: 'Meeting',
  AE: 'Approaching',
  BE: 'Below',
};

export default function ReportCardView({ report, aiComment }) {
  if (!report) return null;
  const { student, subjects, levelCounts, overallAverage, overallLevel, assessmentsCount } = report;

  return (
    <div className="space-y-4">
      <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-bold text-white">{student.name}</h2>
            <p className="text-xs text-blue-400 mt-0.5">
              Adm: {student.admission_no}
              {student.form && <span className="ml-2">• {student.form}{student.stream ? ` ${student.stream}` : ''}</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-blue-500">Overall</p>
            <p className="text-2xl font-bold text-blue-200">{overallAverage ?? '—'}</p>
            {overallLevel && <CompetencyBadge level={overallLevel} showLabel />}
          </div>
        </div>
      </div>

      <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4">
        <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-3">
          Competency distribution ({assessmentsCount} assessments)
        </p>
        <div className="grid grid-cols-4 gap-3">
          {['EE', 'ME', 'AE', 'BE'].map(k => (
            <div key={k}>
              <p className={`text-2xl font-bold ${
                k === 'EE' ? 'text-green-400' :
                k === 'ME' ? 'text-blue-400' :
                k === 'AE' ? 'text-amber-400' : 'text-red-400'
              }`}>{levelCounts[k]}</p>
              <p className="text-[10px] uppercase tracking-wider text-blue-500">
                {k} · {LEVEL_LABEL[k]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {aiComment && (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4">
          <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-2">
            Overall Teacher Comment
          </p>
          <p className="text-sm text-blue-100 leading-relaxed">{aiComment}</p>
        </div>
      )}

      <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-blue-900/40">
          <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
            Subjects ({subjects.length})
          </p>
        </div>
        {subjects.length === 0 ? (
          <p className="text-xs text-blue-400 text-center py-8">No marks recorded for this term.</p>
        ) : (
          <div className="divide-y divide-blue-900/30">
            {subjects.map(s => (
              <div key={s.subject} className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-sm font-bold text-white">{s.subject}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-blue-300">Avg: {s.average ?? '—'}</span>
                    {s.overallLevel && <CompetencyBadge level={s.overallLevel} />}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {s.assessments.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0">
                        <span className="text-blue-200">
                          {a.exam_name || a.assessment_type || 'Assessment'}
                        </span>
                        {(a.strand || a.sub_strand) && (
                          <p className="text-[10px] text-blue-500">
                            {a.strand}{a.strand && a.sub_strand ? ' · ' : ''}{a.sub_strand}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-blue-300">{a.score ?? '—'}</span>
                        <CompetencyBadge level={a.competency_level} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>

                {s.comment && (
                  <p className="mt-2 text-[11px] text-blue-300 bg-[#0a1628] border border-blue-900/40 rounded-md px-2 py-1.5">
                    <span className="text-blue-500">Comment: </span>{s.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}