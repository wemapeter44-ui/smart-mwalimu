import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext({});

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: false,
    resolve: null,
  });

  const confirm = useCallback((opts) => {
    return new Promise(resolve => {
      setState({
        open: true,
        title: opts.title || 'Are you sure?',
        message: opts.message || '',
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
        danger: opts.danger ?? true,
        resolve,
      });
    });
  }, []);

  function close(result) {
    if (state.resolve) state.resolve(result);
    setState(s => ({ ...s, open: false, resolve: null }));
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-[#0d1e35] border border-blue-900/40 rounded-xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white">{state.title}</h3>
            {state.message && (
              <p className="text-xs text-blue-300 mt-2">{state.message}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => close(false)}
                className="flex-1 text-sm text-blue-300 border border-blue-900/60 hover:bg-blue-900/40 rounded-md py-2 transition"
              >
                {state.cancelText}
              </button>
              <button
                onClick={() => close(true)}
                className={`flex-1 text-sm text-white font-semibold rounded-md py-2 transition ${
                  state.danger
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}