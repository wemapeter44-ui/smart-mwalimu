export default function AiInsights({ insights, loading, error, onClose }) {
  if (!insights && !loading && !error) return null;

  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4 mb-5 print:hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white">AI Class Insights</h3>
        </div>
        <button
          onClick={onClose}
          className="text-blue-400 hover:text-white text-lg leading-none"
          aria-label="Close insights"
        >
          ×
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-blue-300 py-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.15s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <span className="ml-2">Analyzing class data…</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {insights && !loading && (
        <div className="text-sm text-blue-100 whitespace-pre-wrap leading-relaxed">
          {insights}
        </div>
      )}
    </div>
  );
}