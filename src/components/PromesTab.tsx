import React from 'react';
import { AppState, Semester } from '../types';
import { DocHeader } from './DocHeader';

interface PromesTabProps {
  state: AppState;
  onCopyDoc: () => void;
  onTabSelect: (tabId: string) => void;
  onSemSelect: (sem: Semester) => void;
  onAutoSebar: (sem: Semester) => void;
  onClearPromes: (sem: Semester) => void;
  onToggleCell: (tpId: string, cellKey: string) => void;
}

export const PromesTab: React.FC<PromesTabProps> = ({
  state,
  onCopyDoc,
  onTabSelect,
  onSemSelect,
  onAutoSebar,
  onClearPromes,
  onToggleCell
}) => {
  const p = state.profil;
  const sem = state.ui.sem;
  const bs = state.bulan.filter(b => b.sem === sem);

  // Compute number map for TPs
  const NOMAP: Record<string, number> = {};
  let count = 0;
  [1, 2].forEach(s => {
    state.unit
      .filter(u => u.sem === s)
      .forEach(u => {
        state.tp
          .filter(t => t.unitId === u.id)
          .forEach(t => {
            count++;
            NOMAP[t.id] = count;
          });
      });
  });
  const getNo = (id: string) => NOMAP[id] || '–';

  const orderedTps = state.unit
    .filter(u => u.sem === sem)
    .flatMap(u => state.tp.filter(t => t.unitId === u.id));

  const totalCols = bs.reduce((acc, b) => acc + b.n, 0);

  const jpTotal = state.unit
    .filter(u => u.sem === sem)
    .flatMap(u => state.tp.filter(t => t.unitId === u.id))
    .reduce((a, t) => a + (Number(t.jp) || 0), 0);

  const dots = (s?: string) => (s ? s : '…………………');

  // Slots count
  const allSlots: string[] = [];
  bs.forEach(b => {
    for (let w = 0; w < b.n; w++) {
      if (!b.off.includes(w)) allSlots.push(`${b.id}:${w}`);
    }
  });

  const usedSlotsObj: Record<string, boolean> = {};
  orderedTps.forEach(t => {
    const set = state.promes[t.id] || [];
    set.forEach(k => {
      usedSlotsObj[k] = true;
    });
  });
  const usedSlotsCount = Object.keys(usedSlotsObj).length;

  if (orderedTps.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DocHeader
          title="Program Semester"
          lead="Letakkan setiap tujuan pembelajaran pada minggu efektif. Klik sel untuk menandai atau menghapus."
          tab="promes"
          isDocView={true}
          onToggleView={() => {}}
          onCopy={onCopyDoc}
          noToggle
          extra={
            <div className="inline-flex border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
              <button
                onClick={() => onSemSelect(1)}
                className={`px-3.5 py-1.5 text-xs font-medium ${
                  sem === 1 ? 'bg-emerald-700 text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Semester 1
              </button>
              <button
                onClick={() => onSemSelect(2)}
                className={`px-3.5 py-1.5 text-xs font-medium ${
                  sem === 2 ? 'bg-emerald-700 text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Semester 2
              </button>
            </div>
          }
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center flex flex-col items-center gap-4">
          <p className="text-slate-600 dark:text-slate-400 m-0">
            Belum ada tujuan pembelajaran di semester {sem}. Susun alurnya di CP–ATP.
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

  const renderDoc = () => {
    let lastU: string | null = null;
    let k = 0;
    const inactiveKet = bs
      .filter(b => b.off.length > 0)
      .map(b => `${b.nama}${b.ket ? ` (${b.ket})` : ''}: minggu ${b.off.map(i => i + 1).join(', ')}`)
      .join('; ');

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <button
              onClick={() => onSemSelect(1)}
              className={`px-3.5 py-1.5 text-xs font-medium ${
                sem === 1 ? 'bg-emerald-700 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Semester 1
            </button>
            <button
              onClick={() => onSemSelect(2)}
              className={`px-3.5 py-1.5 text-xs font-medium ${
                sem === 2 ? 'bg-emerald-700 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Semester 2
            </button>
          </div>
          <button
            onClick={() => onAutoSebar(sem)}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Sebar Otomatis
          </button>
          <button
            onClick={() => onClearPromes(sem)}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
          >
            Kosongkan Jadwal
          </button>
          <span className="text-xs text-slate-500 font-mono ml-auto">
            {usedSlotsCount} dari {allSlots.length} minggu efektif terisi
          </span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl overflow-x-auto shadow-md">
          <article className="p-8 text-slate-900 font-serif text-sm leading-relaxed min-w-[800px] space-y-6">
            <h2 className="text-center font-bold text-base uppercase tracking-wider m-0">
              Program Semester {sem}
            </h2>
            <p className="text-center text-xs text-slate-600 m-0">
              Semester {sem === 1 ? 'Ganjil' : 'Genap'} Tahun Pelajaran {dots(p.ta)}
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
                  <td className="py-1">: {Number(p.jp) || 4} JP</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-slate-800 text-[11px] font-serif">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="border border-slate-800 p-1 text-center w-8" rowSpan={2}>
                    No
                  </th>
                  <th className="border border-slate-800 p-1 text-left min-w-[240px]" rowSpan={2}>
                    Tujuan Pembelajaran
                  </th>
                  <th className="border border-slate-800 p-1 text-center w-12" rowSpan={2}>
                    JP
                  </th>
                  {bs.map(b => (
                    <th key={b.id} className="border border-slate-800 p-1 text-center" colSpan={b.n}>
                      {b.nama}
                    </th>
                  ))}
                </tr>
                <tr className="bg-emerald-50/70">
                  {bs.map(b =>
                    Array.from({ length: b.n }).map((_, i) => (
                      <th key={`${b.id}-${i}`} className="border border-slate-800 p-0.5 text-center w-7">
                        {i + 1}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {orderedTps.map(t => {
                  const u = state.unit.find(x => x.id === t.unitId);
                  const showGroup = u && u.id !== lastU;
                  if (u) lastU = u.id;
                  k++;
                  const set = state.promes[t.id] || [];

                  return (
                    <React.Fragment key={t.id}>
                      {showGroup && u && (
                        <tr className="bg-slate-200 font-bold">
                          <td className="border border-slate-800 p-1.5" colSpan={3 + totalCols}>
                            {u.nama}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="border border-slate-800 p-1 text-center align-middle">
                          {getNo(t.id)}
                        </td>
                        <td className="border border-slate-800 p-1 align-middle">{t.teks}</td>
                        <td className="border border-slate-800 p-1 text-center align-middle">
                          {t.jp}
                        </td>
                        {bs.map(b =>
                          Array.from({ length: b.n }).map((_, i) => {
                            const key = `${b.id}:${i}`;
                            const isOff = b.off.includes(i);
                            const isOn = set.includes(key);

                            if (isOff) {
                              return (
                                <td
                                  key={key}
                                  className="border border-slate-800 p-0 text-center bg-slate-300 text-slate-600 font-bold text-[10px]"
                                  title="Libur / Tidak Efektif"
                                >
                                  L
                                </td>
                              );
                            }

                            return (
                              <td
                                key={key}
                                onClick={() => onToggleCell(t.id, key)}
                                className={`border border-slate-800 p-0 text-center cursor-pointer transition-colors ${
                                  isOn ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-emerald-100'
                                }`}
                              >
                                <button className="w-full h-7 bg-transparent border-0 cursor-pointer font-bold text-xs flex items-center justify-center">
                                  {isOn ? '✓' : ''}
                                </button>
                              </td>
                            );
                          })
                        )}
                      </tr>
                    </React.Fragment>
                  );
                })}
                <tr className="bg-slate-100 font-bold">
                  <td className="border border-slate-800 p-1.5 text-right" colSpan={3}>
                    Jumlah JP
                  </td>
                  <td className="border border-slate-800 p-1.5 text-center" colSpan={totalCols}>
                    {jpTotal} JP
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-[11px] text-slate-600 italic m-0">
              ✓ = minggu pembelajaran. L = minggu tidak efektif.{inactiveKet ? ` Minggu tidak efektif — ${inactiveKet}.` : ''}
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
  };

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        title="Program Semester"
        lead="Letakkan setiap tujuan pembelajaran pada minggu efektif. Klik sel untuk menandai atau menghapus. Minggu tidak efektif dari Analisis Waktu sudah diarsir."
        tab="promes"
        isDocView={true}
        onToggleView={() => {}}
        onCopy={onCopyDoc}
        noToggle
      />
      {renderDoc()}
    </div>
  );
};
