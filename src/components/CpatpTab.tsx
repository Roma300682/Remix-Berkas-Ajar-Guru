import React, { useState } from 'react';
import { AppState, Semester, CpItem, UnitItem, TpItem } from '../types';
import { DocHeader } from './DocHeader';

interface CpatpTabProps {
  state: AppState;
  isDocView: boolean;
  onToggleView: (v: 'edit' | 'doc') => void;
  onCopyDoc: () => void;
  onChangeCp: (id: string, field: string, val: string) => void;
  onAddCp: () => void;
  onDeleteCp: (id: string) => void;
  onChangeUnit: (id: string, field: string, val: any) => void;
  onAddUnit: (sem: Semester) => void;
  onDeleteUnit: (id: string) => void;
  onMoveUnit: (id: string, dir: number) => void;
  onChangeTp: (id: string, field: string, val: any) => void;
  onAddTp: (unitId: string) => void;
  onDeleteTp: (id: string) => void;
  onMoveTp: (id: string, dir: number) => void;
  onApplyAiData: (data: any) => void;
  showToast: (msg: string) => void;
}

export const CpatpTab: React.FC<CpatpTabProps> = ({
  state,
  isDocView,
  onToggleView,
  onCopyDoc,
  onChangeCp,
  onAddCp,
  onDeleteCp,
  onChangeUnit,
  onAddUnit,
  onDeleteUnit,
  onMoveUnit,
  onChangeTp,
  onAddTp,
  onDeleteTp,
  onMoveTp,
  onApplyAiData,
  showToast
}) => {
  const p = state.profil;
  const dots = (s?: string) => (s ? s : '…………………');

  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-cp-atp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapel: p.mapel || 'Akuntansi',
          fase: p.fase || 'E',
          kelas: p.kelas || 'X',
          topik: aiTopic
        })
      });

      if (!res.ok) {
        throw new Error('Gagal terhubung ke server AI');
      }

      const data = await res.json();
      onApplyAiData(data);
      showToast('CP, ATP, KKTP, Prota & Promes berhasil digenerate oleh AI sesuai kurikulum.kemendikdasmen.go.id!');
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat generate AI.');
    } finally {
      setIsGenerating(false);
    }
  };

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

  const orderedTps = (sem: Semester) => {
    const us = state.unit.filter(u => u.sem === sem);
    const out: TpItem[] = [];
    us.forEach(u => {
      state.tp.filter(t => t.unitId === u.id).forEach(t => out.push(t));
    });
    return out;
  };

  const unitTps = (uId: string) => state.tp.filter(t => t.unitId === uId);
  const unitJp = (uId: string) => unitTps(uId).reduce((a, t) => a + (Number(t.jp) || 0), 0);

  const renderEdit = () => (
    <div className="flex flex-col gap-6">
      {/* AI Kurikulum Kemendikdasmen Generator Card */}
      <section className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-xl flex flex-col gap-4 border border-emerald-700/50">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
            ✨ AI Standar Kompetensi Industri & BSNP
          </span>
          <h2 className="text-xl font-bold">Generate CP, ATP, Prota, Promes & KKTP Otomatis</h2>
          <p className="text-xs text-emerald-200/80 max-w-2xl m-0">
            Mengambil acuan dari standar kompetensi industri, BSNP, dan praktik terbaik Ikatan Akuntan Indonesia (IAI). AI akan menyusun Capaian Pembelajaran, Alur Tujuan Pembelajaran per Semester, Rubrik KKTP, serta mendistribusikan Program Tahunan dan Semester secara otomatis sesuai bidang Anda ({p.mapel || 'Akuntansi'}, Fase {p.fase || 'E'}).
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 pt-2">
          <label className="flex flex-col gap-1 flex-1 min-w-[200px] text-xs font-medium text-emerald-200">
            Fokus / Topik Khusus (Opsional)
            <input
              type="text"
              className="px-3.5 py-2 bg-emerald-950/80 border border-emerald-700 rounded-lg text-white text-sm placeholder:text-emerald-500 focus:outline-hidden focus:border-emerald-400"
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              placeholder="mis. Aljabar dan Pecahan mendalam"
            />
          </label>
          <button
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? 'Sedang Menyusun Kurikulum AI...' : '🚀 Generate dengan AI'}
          </button>
        </div>
      </section>

      {/* CP Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Capaian Pembelajaran (CP)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Salin CP resmi mata pelajaran dan fase Anda per elemen dari dokumen Capaian Pembelajaran Kemendikdasmen.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {state.cp.map(c => (
            <div
              key={c.id}
              className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_auto] gap-3 items-start pt-3 border-t border-slate-100 dark:border-slate-800 first:border-0 first:pt-0"
            >
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                Elemen
                <input
                  type="text"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm"
                  value={c.elemen}
                  onChange={e => onChangeCp(c.id, 'elemen', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                Capaian pembelajaran
                <textarea
                  rows={3}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm resize-y"
                  value={c.teks}
                  onChange={e => onChangeCp(c.id, 'teks', e.target.value)}
                />
              </label>
              <button
                onClick={() => onDeleteCp(c.id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg text-xs font-medium transition-colors md:mt-5"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>

        <div>
          <button
            onClick={onAddCp}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
          >
            + Tambah Elemen CP
          </button>
        </div>
      </section>

      {/* ATP Semesters */}
      {[1, 2].map(s => {
        const sem = s as Semester;
        const us = state.unit.filter(u => u.sem === sem);
        const semJp = orderedTps(sem).reduce((a, t) => a + (Number(t.jp) || 0), 0);

        return (
          <section
            key={sem}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col gap-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Alur Tujuan Pembelajaran · Semester {sem}
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {semJp} JP materi
              </span>
            </div>

            {us.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Belum ada unit di semester ini.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {us.map(u => {
                  const tps = unitTps(u.id);
                  const uJp = unitJp(u.id);

                  return (
                    <div
                      key={u.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col gap-3.5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex flex-col gap-1 flex-[2_1_220px] text-xs font-medium text-slate-600 dark:text-slate-400">
                          Lingkup materi / unit
                          <input
                            type="text"
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-sm font-medium"
                            value={u.nama}
                            onChange={e => onChangeUnit(u.id, 'nama', e.target.value)}
                          />
                        </label>
                        <label className="flex flex-col gap-1 flex-[1_1_150px] text-xs font-medium text-slate-600 dark:text-slate-400">
                          Elemen
                          <select
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-sm"
                            value={u.cpId}
                            onChange={e => onChangeUnit(u.id, 'cpId', e.target.value)}
                          >
                            <option value="">—</option>
                            {state.cp.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.elemen}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col gap-1 w-24 text-xs font-medium text-slate-600 dark:text-slate-400">
                          Semester
                          <select
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-sm"
                            value={u.sem}
                            onChange={e => onChangeUnit(u.id, 'sem', Number(e.target.value))}
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                          </select>
                        </label>
                      </div>

                      {/* TP rows */}
                      <div className="flex flex-col gap-2 pt-1">
                        {tps.map(t => (
                          <div key={t.id} className="flex flex-wrap items-start gap-2.5">
                            <span className="text-xs font-bold text-slate-500 pt-2 w-10 shrink-0">
                              TP {getNo(t.id)}
                            </span>
                            <textarea
                              rows={2}
                              className="flex-1 min-w-[220px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-sm resize-y"
                              value={t.teks}
                              onChange={e => onChangeTp(t.id, 'teks', e.target.value)}
                              placeholder="Tujuan pembelajaran..."
                            />
                            <label className="flex flex-col gap-1 w-20 text-xs font-medium text-slate-600 dark:text-slate-400">
                              JP
                              <input
                                type="number"
                                min="0"
                                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 text-sm"
                                value={t.jp}
                                onChange={e => onChangeTp(t.id, 'jp', Number(e.target.value))}
                              />
                            </label>
                            <div className="flex items-center gap-1 pt-5">
                              <button
                                onClick={() => onMoveTp(t.id, -1)}
                                title="Naikkan"
                                className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-100"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => onMoveTp(t.id, 1)}
                                title="Turunkan"
                                className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-100"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => onDeleteTp(t.id)}
                                className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <button
                          onClick={() => onAddTp(u.id)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700"
                        >
                          + Tambah TP
                        </button>
                        <span className="text-xs text-slate-500 font-mono">{uJp} JP di unit ini</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onMoveUnit(u.id, -1)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                          >
                            ↑ Unit
                          </button>
                          <button
                            onClick={() => onMoveUnit(u.id, 1)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                          >
                            ↓ Unit
                          </button>
                          <button
                            onClick={() => onDeleteUnit(u.id)}
                            className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                          >
                            Hapus Unit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <button
                onClick={() => onAddUnit(sem)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700"
              >
                + Tambah Unit Semester {sem}
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );

  const renderDoc = () => {
    const rows: { t: TpItem; u: UnitItem; s: Semester; cp?: CpItem }[] = [];
    [1, 2].forEach(s => {
      orderedTps(s as Semester).forEach(t => {
        const u = state.unit.find(x => x.id === t.unitId);
        if (u) {
          const cp = state.cp.find(c => c.id === u.cpId);
          rows.push({ t, u, s: s as Semester, cp });
        }
      });
    });

    return (
      <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md">
        <article className="p-8 text-slate-900 font-serif text-sm leading-relaxed max-w-5xl mx-auto space-y-6">
          <h2 className="text-center font-bold text-base uppercase tracking-wider m-0">
            Capaian Pembelajaran dan Alur Tujuan Pembelajaran
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
                <td className="py-1">: {Number(p.jp) || 4} JP</td>
              </tr>
            </tbody>
          </table>

          {rows.length === 0 ? (
            <p className="text-xs text-slate-600 italic">Belum ada tujuan pembelajaran.</p>
          ) : (
            <table className="w-full border-collapse border border-slate-800 text-xs font-serif">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="border border-slate-800 p-2 text-left">Elemen</th>
                  <th className="border border-slate-800 p-2 text-left">Capaian Pembelajaran</th>
                  <th className="border border-slate-800 p-2 text-left">Lingkup Materi</th>
                  <th className="border border-slate-800 p-2 text-left">Alur Tujuan Pembelajaran</th>
                  <th className="border border-slate-800 p-2 text-center w-14">JP</th>
                  <th className="border border-slate-800 p-2 text-center w-14">Smt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.t.id}>
                    <td className="border border-slate-800 p-2 align-top font-medium">
                      {r.cp?.elemen || ''}
                    </td>
                    <td className="border border-slate-800 p-2 align-top">{r.cp?.teks || ''}</td>
                    <td className="border border-slate-800 p-2 align-top">{r.u.nama}</td>
                    <td className="border border-slate-800 p-2 align-top">
                      {getNo(r.t.id)}. {r.t.teks}
                    </td>
                    <td className="border border-slate-800 p-2 text-center align-top">{r.t.jp}</td>
                    <td className="border border-slate-800 p-2 text-center align-top">{r.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

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
  };

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        title="CP dan ATP"
        lead="Tuliskan capaian pembelajaran per elemen, lalu susun alur tujuan pembelajaran (ATP) per semester. Semua berkas lain membaca data ini."
        tab="cpatp"
        isDocView={isDocView}
        onToggleView={onToggleView}
        onCopy={onCopyDoc}
      />
      {isDocView ? renderDoc() : renderEdit()}
    </div>
  );
};
