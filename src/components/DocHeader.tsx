import React from 'react';

interface DocHeaderProps {
  title: string;
  lead: string;
  tab: string;
  isDocView: boolean;
  onToggleView: (view: 'edit' | 'doc') => void;
  onCopy: () => void;
  noToggle?: boolean;
  extra?: React.ReactNode;
}

export const DocHeader: React.FC<DocHeaderProps> = ({
  title,
  lead,
  tab,
  isDocView,
  onToggleView,
  onCopy,
  noToggle,
  extra
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-3xl text-sm lg:text-base">{lead}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!noToggle && (
          <div className="inline-flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <button
              onClick={() => onToggleView('edit')}
              aria-pressed={!isDocView}
              className={`px-3.5 py-1.5 text-xs lg:text-sm font-medium transition-colors ${
                !isDocView
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Isi Data
            </button>
            <button
              onClick={() => onToggleView('doc')}
              aria-pressed={isDocView}
              className={`px-3.5 py-1.5 text-xs lg:text-sm font-medium transition-colors ${
                isDocView
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Dokumen
            </button>
          </div>
        )}

        {(isDocView || noToggle) && (
          <button
            onClick={onCopy}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs lg:text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            Salin Dokumen
          </button>
        )}

        {(isDocView || noToggle) && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tempel langsung ke Word atau Google Docs.
          </span>
        )}

        {extra}
      </div>
    </div>
  );
};
