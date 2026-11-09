import React from 'react';
import { AppState, Semester, TpItem } from '../types';
import { DocHeader } from './DocHeader';

interface ProtaTabProps {
  state: AppState;
  onCopyDoc: () => void;
  onTabSelect: (tabId: string) => void;
}

export const ProtaTab: React.FC<ProtaTabProps> = ({ state, onCopyDoc, onTabSelect }) => {
  const p = state.profil;
  const dots = (s?: string) => (s ? s : '…………………');
  const jp = Number(p.jp) || 0;

  const jpAvail = (sem: Semester) => {
    const bs = state.bulan.filter(b => b.sem === sem);
    return bs.reduce((acc, b) => acc + (b.n - b.off.length) * jp, 0);
  };

  const unitTps = (uId: string) => state.tp.filter(t => t.unitId === uId);

  const jpTotal = (sem: Semester) => {
    const uIds = state.unit.filter(u => u.sem === sem).map(u => u.id);
    const tps = state.tp.filter(t => uIds.includes(t.unitId));
    return tps.reduce((acc, t) => acc + (Number(t.jp) || 0), 0);
  };

  if (state.tp.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DocHeader
          title="Program Tahunan"
          lead="Disusun otomatis dari alur tujuan pembelajaran dan analisis waktu. Ubah isinya di CP–ATP."
          tab="prota"
          isDocView={false}
          onToggleView={() => {}}
          onCopy={onCopyDoc}
          noToggle
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center flex flex-col items-center gap-4">
          <p className="text-slate-600 dark:text-slate-400 m-0 max-w-lg">
            Belum ada tujuan pembelajaran. Susun alurnya di CP–ATP, lalu Program Tahunan terisi sendiri.
          </p>
          <button
            onClick={() => onTabSelect('cpatp')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Buka CP–ATP
          </button>
        </div>
      </div>
    );
  }

  let n = 0;

  const renderDoc = () => (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map(s => {
          const sem = s as Semester;
          const av = jpAvail(sem);
          const tot = jpTotal(sem);
          const diff = av - tot;
          const pct = av ? Math.min(100, (tot / av) * 100) : tot ? 100 : 0;
          const isOver = tot > av;

          return (
            <div
              key={sem}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col gap-2"
            >
              <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Semester {sem}</span>
                <span>
                  {tot} JP materi dari {av} JP efektif
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOver ? 'bg-amber-600' : 'bg-emerald-700'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                {diff >= 0
                  ? `Sisa ${diff} JP untuk asesmen, remedial, dan cadangan.`
                  : `Kelebihan ${-diff} JP. Kurangi materi atau tambah minggu efektif.`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md">
        <article className="p-8 text-slate-900 font-serif text-sm leading-relaxed max-w-5xl mx-auto space-y-6">
          <h2 className="text-center font-bold text-base uppercase tracking-wider m-0">
            Program Tahunan
          </h2>
          <p className="text-center text-xs text-slate-600 m-0">
            Tahun Pelajaran {dots(p.ta)}
          </p>

          <table className="w-full text-xs font-serif border-collapse mb-4">
            <tbody>
              <tr>
                <td className="py-1 pr-2 w-36">Satuan Pendidikan</td>
                <td className="py-1">: {dots(p.sekolah)}</td>
                <td className="py-1 pr-2 w-32">Fase / Kelas</td>
                <td className="py-1">: {dots(p.fase)} / {dots(p.kelas)}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2">Mata Pelajaran</td>
                <td className="py-1">: {dots(p.mapel)}</td>
                <td className="py-1 pr-2">Tahun Pelajaran</td>
                <td className="py-1">: {dots(p.ta)}</td>
              </tr>
              <tr>
                <td className="py-1 pr-2">Nama Guru</td>
                <td className="py-1">: {dots(p.guru)}</td>
                <td className="py-1 pr-2">Alokasi per minggu</td>
                <td className="py-1">: {jp} JP</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-slate-800 text-xs font-serif">
            <thead>
              <tr className="bg-emerald-50">
                <th className="border border-slate-800 p-2 text-center w-12">No</th>
                <th className="border border-slate-800 p-2 text-left w-56">Lingkup Materi</th>
                <th className="border border-slate-800 p-2 text-left">Tujuan Pembelajaran</th>
                <th className="border border-slate-800 p-2 text-center w-24">Alokasi Waktu</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map(s => {
                const sem = s as Semester;
                const units = state.unit.filter(u => u.sem === sem);
                return (
                  <React.Fragment key={sem}>
                    <tr className="bg-slate-200 font-bold">
                      <td className="border border-slate-800 p-2" colSpan={4}>
                        Semester {sem} ({sem === 1 ? 'Ganjil' : 'Genap'})
                      </td>
                    </tr>
                    {units.map(u => {
                      const tps = unitTps(u.id);
                      if (tps.length === 0) {
                        return (
                          <tr key={u.id}>
                            <td className="border border-slate-800 p-2 text-center">–</td>
                            <td className="border border-slate-800 p-2">{u.nama}</td>
                            <td className="border border-slate-800 p-2"></td>
                            <td className="border border-slate-800 p-2 text-center">0 JP</td>
                          </tr>
                        );
                      }
                      return tps.map((t, idx) => {
                        n++;
                        return (
                          <tr key={t.id}>
                            <td className="border border-slate-800 p-2 text-center align-top">{n}</td>
                            {idx === 0 && (
                              <td
                                className="border border-slate-800 p-2 align-top font-medium"
                                rowSpan={tps.length}
                              >
                                {u.nama}
                              </td>
                            )}
                            <td className="border border-slate-800 p-2 align-top">{t.teks}</td>
                            <td className="border border-slate-800 p-2 text-center align-top">
                              {Number(t.jp) || 0} JP
                            </td>
                          </tr>
                        );
                      });
                    })}
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-slate-800 p-2 text-right" colSpan={3}>
                        Jumlah JP semester {sem}
                      </td>
                      <td className="border border-slate-800 p-2 text-center">{jpTotal(sem)} JP</td>
                    </tr>
                  </React.Fragment>
                );
              })}
              <tr className="bg-emerald-100 font-bold">
                <td className="border border-slate-800 p-2 text-right" colSpan={3}>
                  Jumlah JP satu tahun
                </td>
                <td className="border border-slate-800 p-2 text-center">
                  {jpTotal(1) + jpTotal(2)} JP
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-[11px] text-slate-600 italic m-0">
            * JP efektif: semester 1 = {jpAvail(1)} JP, semester 2 = {jpAvail(2)} JP (dari Analisis Waktu). Selisihnya dipakai untuk asesmen, remedial, dan kegiatan sekolah.
          </p>

          <table className="w-full border-collapse mt-8 text-xs font-serif">
            <tbody>
              <tr>
                <td className="w-1/2 align-top">
                  Mengetahui,<br />
                  Kepala Sekolah<br /><br /><br /><br />
                  <b><u>{dots(p.kepsek)}</u></b><br />
                  NIP. {p.nipKs || '…………………'}
                </td>
                <td className="w-1/2 align-top text-right">
                  {p.kota || '…………'}, {p.tgl || '…………………'}<br />
                  Guru Mata Pelajaran<br /><br /><br /><br />
                  <b><u>{dots(p.guru)}</u></b><br />
                  NIP. {p.nip || '…………………'}
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        title="Program Tahunan"
        lead="Disusun otomatis dari alur tujuan pembelajaran dan analisis waktu. Ubah isinya di CP–ATP."
        tab="prota"
        isDocView={true}
        onToggleView={() => {}}
        onCopy={onCopyDoc}
        noToggle
      />
      {renderDoc()}
    </div>
  );
};
