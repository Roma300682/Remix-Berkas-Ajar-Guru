import React from 'react';
import { AppState, Semester } from '../types';
import { DocHeader } from './DocHeader';

interface WaktuTabProps {
  state: AppState;
  isDocView: boolean;
  onToggleView: (v: 'edit' | 'doc') => void;
  onCopyDoc: () => void;
  onChangeMonth: (id: string, field: string, val: any) => void;
  onToggleWeekOff: (monthId: string, weekIdx: number) => void;
  onAddMonth: (sem: Semester) => void;
  onDeleteMonth: (id: string) => void;
}

export const WaktuTab: React.FC<WaktuTabProps> = ({
  state,
  isDocView,
  onToggleView,
  onCopyDoc,
  onChangeMonth,
  onToggleWeekOff,
  onAddMonth,
  onDeleteMonth
}) => {
  const p = state.profil;
  const jp = Number(p.jp) || 0;

  const getBulanSem = (sem: Semester) => state.bulan.filter(b => b.sem === sem);
  const mgEf = (b: { n: number; off: number[] }) => b.n - b.off.length;

  const jpAvail = (sem: Semester) => {
    return getBulanSem(sem).reduce((acc, b) => acc + mgEf(b) * jp, 0);
  };

  const jpTotal = (sem: Semester) => {
    const uIds = state.unit.filter(u => u.sem === sem).map(u => u.id);
    const tps = state.tp.filter(t => uIds.includes(t.unitId));
    return tps.reduce((acc, t) => acc + (Number(t.jp) || 0), 0);
  };

  const dots = (s?: string) => (s ? s : '…………………');

  const renderEdit = () => (
    <div className="flex flex-col gap-6">
      {[1, 2].map(s => {
        const sem = s as Semester;
        const bs = getBulanSem(sem);
        const totalWeeks = bs.reduce((a, b) => a + b.n, 0);
        const totalOff = bs.reduce((a, b) => a + b.off.length, 0);
        const totalEf = totalWeeks - totalOff;
        const totalJp = totalEf * jp;

        return (
          <section
            key={sem}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Semester {sem} ({sem === 1 ? 'Ganjil' : 'Genap'})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono m-0">
                {totalWeeks} minggu · {totalOff} tidak efektif · {totalEf} efektif · {totalJp} JP
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {bs.map(b => {
                const effectiveWeeks = mgEf(b);
                const effectiveJp = effectiveWeeks * jp;

                return (
                  <div
                    key={b.id}
                    className="flex flex-col gap-3 p-3.5 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-lg"
                  >
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="flex flex-col gap-1 flex-1 min-w-[140px] text-xs font-medium text-slate-600 dark:text-slate-400">
                        Bulan
                        <input
                          type="text"
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-sm"
                          value={b.nama}
                          onChange={e => onChangeMonth(b.id, 'nama', e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1 w-28 text-xs font-medium text-slate-600 dark:text-slate-400">
                        Jumlah minggu
                        <input
                          type="number"
                          min="1"
                          max="6"
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-sm"
                          value={b.n}
                          onChange={e => onChangeMonth(b.id, 'n', Math.max(1, Math.min(6, Number(e.target.value))))}
                        />
                      </label>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-mono pb-1">
                        <b>{effectiveWeeks}</b> minggu efektif<br />
                        <span className="font-bold text-slate-900 dark:text-slate-100">{effectiveJp} JP</span>
                      </div>
                      <button
                        onClick={() => onDeleteMonth(b.id)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md text-xs font-medium transition-colors ml-auto"
                      >
                        Hapus
                      </button>
                    </div>

                    {/* Weekly Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Array.from({ length: b.n }).map((_, i) => {
                        const isOff = b.off.includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => onToggleWeekOff(b.id, i)}
                            title={`Minggu ke-${i + 1}${isOff ? ' (tidak efektif)' : ''}`}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                              isOff
                                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 line-through'
                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-600'
                            }`}
                          >
                            Mg {i + 1}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-xs"
                      placeholder="Keterangan minggu tidak efektif (libur, asesmen, kegiatan sekolah)"
                      value={b.ket}
                      onChange={e => onChangeMonth(b.id, 'ket', e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <button
                onClick={() => onAddMonth(sem)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
              >
                + Tambah Bulan Semester {sem}
              </button>
            </div>
          </section>
        );
      })}
      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
        * Klik nomor minggu untuk menandainya tidak efektif. Minggu efektif dikalikan JP per minggu (diatur di Beranda) menjadi batas JP semester.
      </p>
    </div>
  );

  const renderDoc = () => (
    <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md">
      <article className="p-8 text-slate-900 font-serif text-sm leading-relaxed max-w-4xl mx-auto space-y-6">
        <h2 className="text-center font-bold text-base uppercase tracking-wider m-0">
          Analisis Alokasi Waktu
        </h2>
        <p className="text-center text-xs text-slate-600 m-0">
          Tahun Pelajaran {dots(p.ta)}
        </p>

        {/* Identity Table */}
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

        {/* Semester Tables */}
        {[1, 2].map(s => {
          const sem = s as Semester;
          const bs = getBulanSem(sem);
          const w = bs.reduce((acc, b) => acc + b.n, 0);
          const o = bs.reduce((acc, b) => acc + b.off.length, 0);
          const ef = w - o;

          return (
            <div key={sem} className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wide mt-4 mb-1">
                Semester {sem} ({sem === 1 ? 'Ganjil' : 'Genap'})
              </h3>
              <table className="w-full border-collapse border border-slate-800 text-xs font-serif">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="border border-slate-800 p-1.5 text-center w-10">No</th>
                    <th className="border border-slate-800 p-1.5 text-left">Bulan</th>
                    <th className="border border-slate-800 p-1.5 text-center w-20">Jml Minggu</th>
                    <th className="border border-slate-800 p-1.5 text-center w-20">Tidak Efektif</th>
                    <th className="border border-slate-800 p-1.5 text-center w-20">Efektif</th>
                    <th className="border border-slate-800 p-1.5 text-center w-20">JP Efektif</th>
                    <th className="border border-slate-800 p-1.5 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {bs.map((b, idx) => {
                    const eff = mgEf(b);
                    return (
                      <tr key={b.id}>
                        <td className="border border-slate-800 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-800 p-1.5">{b.nama}</td>
                        <td className="border border-slate-800 p-1.5 text-center">{b.n}</td>
                        <td className="border border-slate-800 p-1.5 text-center">{b.off.length}</td>
                        <td className="border border-slate-800 p-1.5 text-center">{eff}</td>
                        <td className="border border-slate-800 p-1.5 text-center">{eff * jp}</td>
                        <td className="border border-slate-800 p-1.5">{b.ket}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold bg-slate-100">
                    <td className="border border-slate-800 p-1.5 text-center" colSpan={2}>
                      Jumlah
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center">{w}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{o}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{ef}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{ef * jp}</td>
                    <td className="border border-slate-800 p-1.5"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Recapitulation Table */}
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wide mt-4 mb-1">
            Rekapitulasi Kebutuhan JP
          </h3>
          <table className="w-full border-collapse border border-slate-800 text-xs font-serif">
            <thead>
              <tr className="bg-emerald-50">
                <th className="border border-slate-800 p-1.5 text-center w-24">Semester</th>
                <th className="border border-slate-800 p-1.5 text-center">JP Efektif</th>
                <th className="border border-slate-800 p-1.5 text-center">JP Materi</th>
                <th className="border border-slate-800 p-1.5 text-center">Sisa JP</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map(s => {
                const sem = s as Semester;
                const av = jpAvail(sem);
                const tot = jpTotal(sem);
                return (
                  <tr key={sem}>
                    <td className="border border-slate-800 p-1.5 text-center">{sem}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{av}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{tot}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{av - tot}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[11px] text-slate-600 italic m-0">
            * JP efektif = minggu efektif × {jp} JP per minggu. Sisa JP dipakai untuk asesmen, remedial, dan kegiatan sekolah.
          </p>
        </div>

        {/* Signature */}
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
  );

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        title="Analisis Waktu"
        lead="Hitung minggu dan JP efektif tiap semester. Hasilnya menjadi batas JP untuk Program Tahunan dan Program Semester."
        tab="waktu"
        isDocView={isDocView}
        onToggleView={onToggleView}
        onCopy={onCopyDoc}
      />
      {isDocView ? renderDoc() : renderEdit()}
    </div>
  );
};
