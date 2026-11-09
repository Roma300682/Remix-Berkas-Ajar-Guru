import React from 'react';
import { TABS } from '../data/defaultData';
import { AppState, Semester } from '../types';

interface NavbarProps {
  state: AppState;
  onSelectTab: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ state, onSelectTab }) => {
  const p = state.profil;
  const brandSub = [
    p.mapel,
    p.fase ? `Fase ${p.fase}` : '',
    p.kelas ? `Kelas ${p.kelas}` : '',
    p.ta ? `TP ${p.ta}` : ''
  ]
    .filter(Boolean)
    .join(' · ') || 'Perangkat ajar Kurikulum Merdeka';

  // Calculate status for each tab
  const getStatus = (id: string): number => {
    const n = state.tp.length;
    const U = state.unit.length;
    const ratioSt = (r: number) => (r <= 0 ? 0 : r >= 1 ? 2 : 1);
    const jpAvail = (s: Semester) => {
      const bs = state.bulan.filter(b => b.sem === s);
      return bs.reduce((acc, b) => acc + (b.n - b.off.length) * (Number(p.jp) || 0), 0);
    };
    const jpTotal = (s: Semester) => {
      const uIds = state.unit.filter(u => u.sem === s).map(u => u.id);
      const tps = state.tp.filter(t => uIds.includes(t.unitId));
      return tps.reduce((acc, t) => acc + (Number(t.jp) || 0), 0);
    };

    switch (id) {
      case 'mulai': {
        const fields = ['guru', 'sekolah', 'mapel', 'kelas', 'ta', 'kepsek'];
        const filled = fields.filter(k => Boolean((p as any)[k])).length;
        return ratioSt(filled / fields.length);
      }
      case 'waktu':
        return jpAvail(1) > 0 && jpAvail(2) > 0 ? 2 : jpAvail(1) > 0 || jpAvail(2) > 0 ? 1 : 0;
      case 'cpatp': {
        const r = n ? state.tp.filter(t => t.teks && Number(t.jp) > 0).length / n : 0;
        return ratioSt(state.cp.length ? r : Math.min(r, 0.5));
      }
      case 'prota':
        return !n ? 0 : jpTotal(1) <= jpAvail(1) && jpTotal(2) <= jpAvail(2) ? 2 : 1;
      case 'promes':
        return ratioSt(n ? state.tp.filter(t => (state.promes[t.id] || []).length).length / n : 0);
      case 'kktp':
        return ratioSt(n ? state.tp.filter(t => t.ind && t.r1 && t.r2 && t.r3 && t.r4).length / n : 0);
      case 'modul':
        return ratioSt(U ? state.unit.filter(u => {
          const m = state.modul[u.id];
          return m && m.pendahuluan && m.memahami;
        }).length / U : 0);
      case 'lkpd':
        return ratioSt(U ? state.unit.filter(u => {
          const l = state.lkpd[u.id];
          return l && l.tugas;
        }).length / U : 0);
      default:
        return 0;
    }
  };

  const STL = ['Belum', 'Sebagian', 'Selesai'];

  return (
    <aside className="side lg:sticky lg:top-3 flex flex-col gap-4 min-w-0">
      <div className="brand px-2 lg:px-0">
        <h1 className="font-bold text-xl lg:text-[22px] tracking-tight text-slate-900 dark:text-slate-100">
          Berkas Ajar Guru
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{brandSub}</p>
      </div>
      <nav className="nav flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-thin">
        {TABS.map(t => {
          const s = getStatus(t.id);
          const current = state.ui.tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              aria-current={current ? 'page' : undefined}
              className={`navbtn flex items-center gap-2.5 text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap lg:whitespace-normal ${
                current
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span
                className={`step w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  s === 2
                    ? 'bg-emerald-700 border-emerald-700 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-slate-950'
                    : s === 1
                    ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400'
                }`}
              >
                {t.n || '⌂'}
              </span>
              <span className="truncate">{t.l}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
